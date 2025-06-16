const express = require('express');
const router = express.Router();
const cartDetailController = require('../controllers/cartDetailController');
const auth = require('../middleware/auth');

// Get all cart details
router.get('/', auth, cartDetailController.getAllCartDetails);

// Get cart details by cart ID
router.get('/cart/:cartId', auth, cartDetailController.getCartDetailsByCartId);

// Get cart details by user email
router.get('/user/:userEmail', auth, cartDetailController.getCartDetailsByUserEmail);

// Get cart details with total price greater than amount
router.get('/min-total/:minTotal', auth, cartDetailController.getCartDetailsByMinTotal);

module.exports = router; 