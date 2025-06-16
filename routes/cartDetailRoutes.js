const express = require('express');
const router = express.Router();
const cartDetailController = require('../controllers/cartDetailController');
const { authenticateToken } = require('../middleware/auth');

// Get all cart details
router.get('/', authenticateToken, cartDetailController.getAllCartDetails);

// Get cart details by cart ID
router.get('/cart/:cartId', authenticateToken, cartDetailController.getCartDetailsByCartId);

// Get cart details by user email
router.get('/user/:userEmail', authenticateToken, cartDetailController.getCartDetailsByUserEmail);

// Get cart details with total price greater than amount
router.get('/min-total/:minTotal', authenticateToken, cartDetailController.getCartDetailsByMinTotal);

module.exports = router; 