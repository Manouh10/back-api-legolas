// controllers/panierController.js
const Panier = require("../models/panierModel");
const LignePanier = require("../models/lignePanierModel");
const Produit = require("../models/produitModel");
const User = require("../models/userModel"); // Pour l'association

const panierController = {
  /**
   * @swagger
   * /api/cart:
   * get:
   * tags:
   * - Paniers
   * summary: Récupérer le panier de l'utilisateur authentifié
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Le panier de l'utilisateur avec ses articles. Crée un panier si l'utilisateur n'en a pas.
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * id:
   * type: integer
   * userId:
   * type: integer
   * LignePaniers:
   * type: array
   * items:
   * type: object
   * properties:
   * id:
   * type: integer
   * quantity:
   * type: integer
   * Produit:
   * $ref: '#/components/schemas/Produit'
   * 401:
   * description: Non autorisé (token manquant ou invalide).
   * 500:
   * description: Erreur serveur.
   */
  async getCart(req, res) {
    try {
      const userId = req.user.id; // L'ID de l'utilisateur est extrait du token JWT

      let panier = await Panier.findOne({
        where: { userId },
        include: {
          model: LignePanier,
          include: Produit, // Inclut les détails du produit
        },
      });

      // Si le panier n'existe pas pour cet utilisateur, le créer
      if (!panier) {
        panier = await Panier.create({ userId });
        // Recharger le panier avec les LignePaniers (qui seront vides)
        panier = await Panier.findByPk(panier.id, {
          include: {
            model: LignePanier,
            include: Produit,
          },
        });
      }

      res.json(panier);
    } catch (error) {
      console.error("Erreur lors de la récupération du panier:", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération du panier." });
    }
  },

  /**
   * @swagger
   * /api/cart/add:
   * post:
   * tags:
   * - Paniers
   * summary: Ajouter un produit au panier ou mettre à jour sa quantité
   * security:
   * - BearerAuth: []
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * required:
   * - produitId
   * - quantity
   * properties:
   * produitId:
   * type: integer
   * example: 1
   * quantity:
   * type: integer
   * example: 2
   * responses:
   * 200:
   * description: Produit ajouté/mis à jour dans le panier.
   * 400:
   * description: Données invalides, stock insuffisant ou produit introuvable.
   * 401:
   * description: Non autorisé.
   * 500:
   * description: Erreur serveur.
   */
  async addProductToCart(req, res) {
    try {
      const userId = req.user.id;
      const { produitId, quantity } = req.body;

      if (quantity <= 0) {
        return res.status(400).json({ message: "La quantité doit être supérieure à zéro." });
      }

      // Récupérer ou créer le panier de l'utilisateur
      let [panier] = await Panier.findOrCreate({
        where: { userId },
        defaults: { userId },
      });

      // Vérifier si le produit existe et si le stock est suffisant
      const produit = await Produit.findByPk(produitId);
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }

      let lignePanier = await LignePanier.findOne({
        where: { panierId: panier.id, produitId },
      });

      if (lignePanier) {
        // Mettre à jour la quantité existante
        const newQuantity = lignePanier.quantity + quantity;
        if (newQuantity > produit.stock) {
          return res.status(400).json({ message: `Stock insuffisant pour ${produit.name}. Stock disponible: ${produit.stock}, Tentative d'ajout: ${quantity}, Actuellement dans panier: ${lignePanier.quantity}` });
        }
        await lignePanier.update({ quantity: newQuantity });
      } else {
        // Créer une nouvelle ligne de panier
        if (quantity > produit.stock) {
          return res.status(400).json({ message: `Stock insuffisant pour ${produit.name}. Stock disponible: ${produit.stock}, Tentative d'ajout: ${quantity}` });
        }
        lignePanier = await LignePanier.create({
          panierId: panier.id,
          produitId,
          quantity,
        });
      }

      // Recharger le panier pour renvoyer la dernière version avec les produits inclus
      const updatedPanier = await Panier.findByPk(panier.id, {
        include: {
          model: LignePanier,
          include: Produit,
        },
      });

      res.status(200).json(updatedPanier);
    } catch (error) {
      console.error("Erreur lors de l'ajout/mise à jour du produit dans le panier:", error);
      res.status(500).json({ message: "Erreur serveur lors de l'opération sur le panier." });
    }
  },

  /**
   * @swagger
   * /api/cart/update-item:
   * put:
   * tags:
   * - Paniers
   * summary: Mettre à jour la quantité d'un article spécifique dans le panier
   * security:
   * - BearerAuth: []
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * required:
   * - produitId
   * - newQuantity
   * properties:
   * produitId:
   * type: integer
   * example: 1
   * newQuantity:
   * type: integer
   * example: 3
   * responses:
   * 200:
   * description: Quantité de l'article mise à jour avec succès.
   * 400:
   * description: Quantité invalide, stock insuffisant ou article introuvable dans le panier.
   * 401:
   * description: Non autorisé.
   * 404:
   * description: Produit ou article du panier non trouvé.
   * 500:
   * description: Erreur serveur.
   */
  async updateCartItemQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { produitId, newQuantity } = req.body;

      if (newQuantity < 0) {
        return res.status(400).json({ message: "La nouvelle quantité ne peut pas être négative." });
      }

      const panier = await Panier.findOne({ where: { userId } });
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé pour cet utilisateur." });
      }

      const lignePanier = await LignePanier.findOne({
        where: { panierId: panier.id, produitId },
      });

      if (!lignePanier) {
        return res.status(404).json({ message: "Article non trouvé dans le panier." });
      }

      const produit = await Produit.findByPk(produitId);
      if (!produit) {
        // Cela ne devrait pas arriver si le produit a été ajouté correctement
        return res.status(404).json({ message: "Produit associé à l'article du panier introuvable." });
      }

      if (newQuantity === 0) {
        // Si la nouvelle quantité est 0, supprimer l'article du panier
        await lignePanier.destroy();
        const updatedPanier = await Panier.findByPk(panier.id, {
          include: { model: LignePanier, include: Produit },
        });
        return res.status(200).json(updatedPanier);
      }

      if (newQuantity > produit.stock) {
        return res.status(400).json({ message: `Stock insuffisant pour ${produit.name}. Stock disponible: ${produit.stock}` });
      }

      await lignePanier.update({ quantity: newQuantity });

      const updatedPanier = await Panier.findByPk(panier.id, {
        include: {
          model: LignePanier,
          include: Produit,
        },
      });

      res.status(200).json(updatedPanier);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité dans le panier:", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la quantité de l'article." });
    }
  },

  /**
   * @swagger
   * /api/cart/remove/{produitId}:
   * delete:
   * tags:
   * - Paniers
   * summary: Supprimer un produit du panier
   * parameters:
   * - in: path
   * name: produitId
   * schema:
   * type: integer
   * required: true
   * description: ID du produit à supprimer du panier.
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Produit supprimé du panier avec succès.
   * 401:
   * description: Non autorisé.
   * 404:
   * description: Produit non trouvé dans le panier.
   * 500:
   * description: Erreur serveur.
   */
  async removeProductFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { produitId } = req.params;

      const panier = await Panier.findOne({ where: { userId } });
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé pour cet utilisateur." });
      }

      const result = await LignePanier.destroy({
        where: { panierId: panier.id, produitId },
      });

      if (result === 0) {
        return res.status(404).json({ message: "Produit non trouvé dans le panier." });
      }

      // Recharger le panier pour renvoyer la dernière version
      const updatedPanier = await Panier.findByPk(panier.id, {
        include: {
          model: LignePanier,
          include: Produit,
        },
      });

      res.json(updatedPanier);
    } catch (error) {
      console.error("Erreur lors de la suppression du produit du panier:", error);
      res.status(500).json({ message: "Erreur serveur lors de la suppression du produit du panier." });
    }
  },

  /**
   * @swagger
   * /api/cart/clear:
   * delete:
   * tags:
   * - Paniers
   * summary: Vider le panier de l'utilisateur
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Panier vidé avec succès.
   * 401:
   * description: Non autorisé.
   * 404:
   * description: Panier non trouvé.
   * 500:
   * description: Erreur serveur.
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      const panier = await Panier.findOne({ where: { userId } });
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé pour cet utilisateur." });
      }

      await LignePanier.destroy({
        where: { panierId: panier.id },
      });

      // Recharger le panier (maintenant vide)
      const clearedPanier = await Panier.findByPk(panier.id, {
        include: {
          model: LignePanier,
          include: Produit,
        },
      });

      res.json(clearedPanier);
    } catch (error) {
      console.error("Erreur lors du vidage du panier:", error);
      res.status(500).json({ message: "Erreur serveur lors du vidage du panier." });
    }
  },
};

module.exports = panierController;
