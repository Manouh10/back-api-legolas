const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const Produit = require('../models/produitModel');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

const cartController = {
    /**
     * @swagger
     * /api/cart:
     *   get:
     *     tags:
     *       - Cart
     *     summary: Récupère le panier actif de l'utilisateur
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Panier récupéré avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     *       404:
     *         description: Panier non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async getCart(req, res) {
        try {
            const cart = await Cart.findOne({
                where: {
                    userId: req.user.id,
                    isActive: true
                },
                include: [{
                    model: CartItem,
                    include: [{
                        model: Produit,
                        attributes: ['id', 'name', 'price', 'imageUrl']
                    }]
                }]
            });

            if (!cart) {
                return res.status(404).json({
                    success: false,
                    message: "Aucun panier actif trouvé"
                });
            }

            res.json(cart);
        } catch (error) {
            console.error('Erreur lors de la récupération du panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la récupération du panier"
            });
        }
    },

    /**
     * @swagger
     * /api/cart:
     *   post:
     *     tags:
     *       - Cart
     *     summary: Crée un nouveau panier
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       201:
     *         description: Panier créé avec succès
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     *       500:
     *         description: Erreur serveur
     */
    async createCart(req, res) {
        try {
            // Désactive tous les paniers actifs de l'utilisateur
            await Cart.update(
                { isActive: false },
                {
                    where: {
                        userId: req.user.id,
                        isActive: true
                    }
                }
            );

            // Crée un nouveau panier
            const cart = await Cart.create({
                userId: req.user.id,
                isActive: true
            });

            res.status(201).json(cart);
        } catch (error) {
            console.error('Erreur lors de la création du panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la création du panier"
            });
        }
    },

    /**
     * @swagger
     * /api/cart/items:
     *   post:
     *     tags:
     *       - Cart
     *     summary: Ajoute un produit au panier
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - productId
     *               - quantity
     *             properties:
     *               productId:
     *                 type: integer
     *               quantity:
     *                 type: integer
     *                 minimum: 1
     *     responses:
     *       200:
     *         description: Produit ajouté au panier avec succès
     *       400:
     *         description: Données invalides
     *       404:
     *         description: Produit non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async addItemToCart(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { productId, quantity } = req.body;

            // Vérifie si le produit existe
            const product = await Produit.findByPk(productId);
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Produit non trouvé"
                });
            }

            // Vérifie le stock
            if (product.stock < quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Stock insuffisant"
                });
            }

            // Récupère ou crée un panier actif
            let cart = await Cart.findOne({
                where: {
                    userId: req.user.id,
                    isActive: true
                }
            });

            if (!cart) {
                cart = await Cart.create({
                    userId: req.user.id,
                    isActive: true
                }, { transaction });
            }

            // Vérifie si le produit est déjà dans le panier
            let cartItem = await CartItem.findOne({
                where: {
                    cartId: cart.id,
                    productId: productId
                }
            });

            if (cartItem) {
                // Met à jour la quantité
                cartItem.quantity += quantity;
                await cartItem.save({ transaction });
            } else {
                // Ajoute un nouvel élément
                cartItem = await CartItem.create({
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity
                }, { transaction });
            }

            await transaction.commit();

            // Récupère le panier mis à jour avec tous ses éléments
            const updatedCart = await Cart.findOne({
                where: { id: cart.id },
                include: [{
                    model: CartItem,
                    include: [{
                        model: Produit,
                        attributes: ['id', 'name', 'price', 'imageUrl']
                    }]
                }]
            });

            res.json(updatedCart);
        } catch (error) {
            await transaction.rollback();
            console.error('Erreur lors de l\'ajout au panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors de l'ajout au panier"
            });
        }
    },

    /**
     * @swagger
     * /api/cart/items/{itemId}:
     *   put:
     *     tags:
     *       - Cart
     *     summary: Met à jour la quantité d'un produit dans le panier
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: itemId
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - quantity
     *             properties:
     *               quantity:
     *                 type: integer
     *                 minimum: 1
     *     responses:
     *       200:
     *         description: Quantité mise à jour avec succès
     *       400:
     *         description: Données invalides
     *       404:
     *         description: Élément du panier non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async updateCartItem(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            const cartItem = await CartItem.findOne({
                where: {
                    id: itemId,
                    '$Cart.userId$': req.user.id,
                    '$Cart.isActive$': true
                },
                include: [{
                    model: Cart,
                    required: true
                }, {
                    model: Produit,
                    required: true
                }]
            });

            if (!cartItem) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Élément du panier non trouvé"
                });
            }

            // Vérifie le stock
            if (cartItem.Produit.stock < quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Stock insuffisant"
                });
            }

            cartItem.quantity = quantity;
            await cartItem.save({ transaction });

            await transaction.commit();

            // Récupère le panier mis à jour
            const updatedCart = await Cart.findOne({
                where: { id: cartItem.cartId },
                include: [{
                    model: CartItem,
                    include: [{
                        model: Produit,
                        attributes: ['id', 'name', 'price', 'imageUrl']
                    }]
                }]
            });

            res.json(updatedCart);
        } catch (error) {
            await transaction.rollback();
            console.error('Erreur lors de la mise à jour du panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la mise à jour du panier"
            });
        }
    },

    /**
     * @swagger
     * /api/cart/items/{itemId}:
     *   delete:
     *     tags:
     *       - Cart
     *     summary: Supprime un produit du panier
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: itemId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Produit supprimé du panier avec succès
     *       404:
     *         description: Élément du panier non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async removeCartItem(req, res) {
        try {
            const { itemId } = req.params;

            const cartItem = await CartItem.findOne({
                where: {
                    id: itemId,
                    '$Cart.userId$': req.user.id,
                    '$Cart.isActive$': true
                },
                include: [{
                    model: Cart,
                    required: true
                }]
            });

            if (!cartItem) {
                return res.status(404).json({
                    success: false,
                    message: "Élément du panier non trouvé"
                });
            }

            await cartItem.destroy();

            // Récupère le panier mis à jour
            const updatedCart = await Cart.findOne({
                where: { id: cartItem.cartId },
                include: [{
                    model: CartItem,
                    include: [{
                        model: Produit,
                        attributes: ['id', 'name', 'price', 'imageUrl']
                    }]
                }]
            });

            res.json(updatedCart);
        } catch (error) {
            console.error('Erreur lors de la suppression du panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la suppression du panier"
            });
        }
    },

    /**
     * @swagger
     * /api/cart:
     *   delete:
     *     tags:
     *       - Cart
     *     summary: Vide le panier
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Panier vidé avec succès
     *       404:
     *         description: Panier non trouvé
     *       500:
     *         description: Erreur serveur
     */
    async clearCart(req, res) {
        const transaction = await sequelize.transaction();

        try {
            const cart = await Cart.findOne({
                where: {
                    userId: req.user.id,
                    isActive: true
                }
            });

            if (!cart) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Panier non trouvé"
                });
            }

            // Supprime tous les éléments du panier
            await CartItem.destroy({
                where: { cartId: cart.id },
                transaction
            });

            await transaction.commit();

            res.json({
                success: true,
                message: "Panier vidé avec succès"
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Erreur lors du vidage du panier:', error);
            res.status(500).json({
                success: false,
                message: "Erreur serveur lors du vidage du panier"
            });
        }
    }
};

module.exports = cartController; 