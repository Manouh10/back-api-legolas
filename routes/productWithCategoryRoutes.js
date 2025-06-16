const express = require('express');
const router = express.Router();
const productWithCategoryController = require('../controllers/productWithCategoryController');
const { authenticateToken } = require('../middleware/auth');

// Get all products with categories
router.get('/', authenticateToken, productWithCategoryController.getAllProductsWithCategories);

// Get product with category by ID
router.get('/:id', authenticateToken, productWithCategoryController.getProductWithCategoryById);

// Get products by category
router.get('/category/:categorySlug', authenticateToken, productWithCategoryController.getProductsByCategory);

// Get products in stock
router.get('/stock/available', authenticateToken, productWithCategoryController.getProductsInStock);

module.exports = router; 