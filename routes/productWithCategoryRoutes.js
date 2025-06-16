const express = require('express');
const router = express.Router();
const productWithCategoryController = require('../controllers/productWithCategoryController');
const auth = require('../middleware/auth');

// Get all products with categories
router.get('/', auth, productWithCategoryController.getAllProductsWithCategories);

// Get product with category by ID
router.get('/:id', auth, productWithCategoryController.getProductWithCategoryById);

// Get products by category
router.get('/category/:categorySlug', auth, productWithCategoryController.getProductsByCategory);

// Get products in stock
router.get('/stock/available', auth, productWithCategoryController.getProductsInStock);

module.exports = router; 