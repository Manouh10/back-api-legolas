const express = require('express');
const router = express.Router();
const { getProductOfTheDay } = require('../controllers/productController');

// Route pour récupérer le produit du jour
router.get('/product-of-the-day', getProductOfTheDay);

module.exports = router; 