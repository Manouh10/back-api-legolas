// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panierController");
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


// Obtenir le panier de l'utilisateur authentifié
router.get("/", auth, panierController.getCart);

// Ajouter un produit au panier ou mettre à jour sa quantité
router.post(
  "/add",
  auth,
  [
    body("produitId").isInt().withMessage("L'ID du produit doit être un entier."),
    body("quantity").isInt({ min: 1 }).withMessage("La quantité doit être un entier positif."),
  ],
  panierController.addProductToCart
);

// Mettre à jour la quantité d'un article spécifique dans le panier
router.put(
  "/update-item",
  auth,
  [
    body("produitId").isInt().withMessage("L'ID du produit doit être un entier."),
    body("newQuantity")
      .isInt({ min: 0 })
      .withMessage("La nouvelle quantité doit être un entier positif ou zéro."),
  ],
  panierController.updateCartItemQuantity
);

// Supprimer un produit du panier
router.delete("/remove/:produitId", auth, panierController.removeProductFromCart);

// Vider le panier de l'utilisateur
router.delete("/clear", auth, panierController.clearCart);

module.exports = router;
