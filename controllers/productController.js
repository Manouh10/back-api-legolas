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



module.exports = {
    getProductOfTheDay
}; 