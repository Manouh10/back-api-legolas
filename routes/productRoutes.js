const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductOfTheDay
} = require('../controllers/productController');

// Route pour récupérer tous les produits
router.get('/', getAllProducts);

// Route pour récupérer un produit par son ID
router.get('/:id', getProductById);

// Route pour créer un nouveau produit
router.post('/', createProduct);

// Route pour mettre à jour un produit
router.put('/:id', updateProduct);

// Route pour supprimer un produit
router.delete('/:id', deleteProduct);

// Route pour récupérer le produit du jour
router.get('/product-of-the-day', getProductOfTheDay);

module.exports = router; 