// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const produitController = require("../controllers/productController");
const auth = require("../middleware/auth"); // Middleware d'authentification existant 
const adminAuth = require("../middleware/auth");
const { body } = require("express-validator"); // Pour la validation des requêtes

// Validation pour la création/mise à jour de produit
const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom du produit est requis.")
    .isLength({ min: 3 })
    .withMessage("Le nom du produit doit contenir au moins 3 caractères."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Le prix doit être un nombre positif."),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Le stock doit être un entier positif ou zéro."),
  body("isProductOfTheDay") // Validation pour le nouveau champ
    .isBoolean()
    .optional()
    .withMessage("isProductOfTheDay doit être un booléen."),
];

/**
 * @swagger
 * components:
 * schemas:
 * Produit:
 * type: object
 * required:
 * - name
 * - price
 * - stock
 * properties:
 * id:
 * type: integer
 * description: L'ID auto-incrémenté du produit.
 * name:
 * type: string
 * description: Le nom du produit.
 * description:
 * type: string
 * description: La description du produit.
 * price:
 * type: number
 * format: float
 * description: Le prix du produit.
 * stock:
 * type: integer
 * description: La quantité en stock du produit.
 * imageUrl:
 * type: string
 * description: L'URL de l'image du produit.
 * isProductOfTheDay:
 * type: boolean
 * description: Indique si le produit est le produit du jour.
 * created_at:
 * type: string
 * format: date-time
 * description: La date de création du produit.
 * updated_at:
 * type: string
 * format: date-time
 * description: La date de dernière mise à jour du produit.
 */

// Route pour récupérer le produit du jour (accessible sans authentification)
router.get('/product-of-the-day', produitController.getProductOfTheDay);

// Obtenir tous les produits (accessible à tous les utilisateurs authentifiés)
router.get("/", auth, produitController.getAllProducts);

// Obtenir un produit par ID (accessible à tous les utilisateurs authentifiés)
router.get("/:id", auth, produitController.getProductById);

// Créer un nouveau produit (Admin seulement)
router.post("/", auth, adminAuth, productValidation, produitController.createProduct);

// Mettre à jour un produit (Admin seulement)
router.put("/:id", auth, adminAuth, productValidation, produitController.updateProduct);

// Supprimer un produit (Admin seulement)
router.delete("/:id", auth, adminAuth, produitController.deleteProduct);

module.exports = router;
