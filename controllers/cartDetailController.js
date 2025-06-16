const CartDetail = require('../models/CartDetail');
const { Op } = require('sequelize');

// Get all cart details
exports.getAllCartDetails = async (req, res) => {
    try {
        const cartDetails = await CartDetail.findAll();
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart details by cart ID
exports.getCartDetailsByCartId = async (req, res) => {
    try {
        const cartDetails = await CartDetail.findAll({
            where: {
                cart_id: req.params.cartId
            }
        });
        if (!cartDetails.length) {
            return res.status(404).json({ message: 'No items found in this cart' });
        }
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart details by user email
exports.getCartDetailsByUserEmail = async (req, res) => {
    try {
        const cartDetails = await CartDetail.findAll({
            where: {
                user_email: req.params.userEmail
            }
        });
        if (!cartDetails.length) {
            return res.status(404).json({ message: 'No items found for this user' });
        }
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart details with total price greater than amount
exports.getCartDetailsByMinTotal = async (req, res) => {
    try {
        const minTotal = parseFloat(req.params.minTotal);
        const cartDetails = await CartDetail.findAll({
            where: {
                total_price: {
                    [Op.gt]: minTotal
                }
            }
        });
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 