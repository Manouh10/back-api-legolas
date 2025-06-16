const pool = require('../config/db');

/**
 * @swagger
 * /products/product-of-the-day:
 *   get:
 *     tags:
 *       - Products
 *     summary: Récupère le produit du jour
 *     description: Retourne le produit marqué comme produit du jour
 *     responses:
 *       200:
 *         description: Produit du jour trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/definitions/ProductOfTheDay'
 *       404:
 *         description: Aucun produit du jour n'est disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Aucun produit du jour n'est disponible"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de la récupération du produit du jour"
 */
const getProductOfTheDay = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_of_the_day');

        const rows = result[0]; // Correction ici

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucun produit du jour n'est disponible"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du produit du jour:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @swagger
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Récupère tous les produits
 *     description: Retourne la liste de tous les produits avec leurs catégories
 *     responses:
 *       200:
 *         description: Liste des produits récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/ProductOfTheDay'
 *       500:
 *         description: Erreur serveur
 */
const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products_with_category');
        const rows = result[0];

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Récupère un produit par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/definitions/ProductOfTheDay'
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products_with_category WHERE id = ?', [id]);
        const rows = result[0];

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Produit non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Crée un nouveau produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Épée de Mithril"
 *               description:
 *                 type: string
 *                 example: "Lame forgée dans le mithril des mines de la Moria"
 *               price:
 *                 type: number
 *                 example: 2500.00
 *               currency:
 *                 type: string
 *                 example: "GAR"
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               image_url:
 *                 type: string
 *                 example: "/images/epee-mithril.jpg"
 *               stock_quantity:
 *                 type: integer
 *                 example: 3
 *               is_product_of_day:
 *                 type: boolean
 *                 example: false
 *               product_ref:
 *                 type: string
 *                 example: "ARM-045"
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            currency,
            category_id,
            image_url,
            stock_quantity,
            is_product_of_day,
            product_ref
        } = req.body;

        const result = await pool.query(
            'INSERT INTO products (name, description, price, currency, category_id, image_url, stock_quantity, is_product_of_day, product_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, currency, category_id, image_url, stock_quantity, is_product_of_day, product_ref]
        );

        const newProductId = result[0].insertId;
        const [newProduct] = await pool.query('SELECT * FROM products_with_category WHERE id = ?', [newProductId]);

        res.status(201).json({
            success: true,
            data: newProduct[0]
        });
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Met à jour un produit existant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               image_url:
 *                 type: string
 *               stock_quantity:
 *                 type: integer
 *               is_product_of_day:
 *                 type: boolean
 *               product_ref:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            currency,
            category_id,
            image_url,
            stock_quantity,
            is_product_of_day,
            product_ref
        } = req.body;

        const result = await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, currency = ?, category_id = ?, image_url = ?, stock_quantity = ?, is_product_of_day = ?, product_ref = ? WHERE id = ?',
            [name, description, price, currency, category_id, image_url, stock_quantity, is_product_of_day, product_ref, id]
        );

        if (result[0].affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Produit non trouvé"
            });
        }

        const [updatedProduct] = await pool.query('SELECT * FROM products_with_category WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            data: updatedProduct[0]
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Supprime un produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM products WHERE id = ?', [id]);

        if (result[0].affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Produit non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Produit supprimé avec succès"
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductOfTheDay
}; 