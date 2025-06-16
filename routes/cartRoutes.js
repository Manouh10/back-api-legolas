// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middleware/auth"); // Middleware d'authentification existant
const { body } = require("express-validator"); // Pour la validation

/**
 * @swagger
 * components:
 * schemas:
 * LignePanier:
 * type: object
 * required:
 * - panierId
 * - produitId
 * - quantity
 * properties:
 * id:
 * type: integer
 * description: L'ID auto-incrémenté de la ligne de panier.
 * panierId:
 * type: integer
 * description: L'ID du panier auquel appartient cette ligne.
 * produitId:
 * type: integer
 * description: L'ID du produit dans cette ligne.
 * quantity:
 * type: integer
 * description: La quantité du produit dans cette ligne.
 * created_at:
 * type: string
 * format: date-time
 * description: La date de création de la ligne.
 * updated_at:
 * type: string
 * format: date-time
 * description: La date de dernière mise à jour de la ligne.
 *
 * PanierComplet:
 * type: object
 * properties:
 * id:
 * type: integer
 * description: L'ID du panier.
 * userId:
 * type: integer
 * description: L'ID de l'utilisateur propriétaire du panier.
 * created_at:
 * type: string
 * format: date-time
 * updated_at:
 * type: string
 * format: date-time
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
 */

// Validation pour les éléments du panier
const cartItemValidation = [
    body('productId')
        .isInt()
        .withMessage('L\'ID du produit doit être un nombre entier'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('La quantité doit être un nombre entier positif')
];

// Routes du panier
router.get('/', auth, cartController.getCart);
router.post('/', auth, cartController.createCart);
router.delete('/', auth, cartController.clearCart);

// Routes des éléments du panier
router.post('/items', auth, cartItemValidation, cartController.addItemToCart);
router.put('/items/:itemId', auth, cartItemValidation, cartController.updateCartItem);
router.delete('/items/:itemId', auth, cartController.removeCartItem);

module.exports = router;
