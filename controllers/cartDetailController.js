const sequelize = require('../config/db');

// Get all cart details
exports.getAllCartDetails = async (req, res) => {
    try {
        const [cartDetails] = await sequelize.query(`
            SELECT * FROM cart_details
        `);
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get cart details by cart ID
exports.getCartDetailsByCartId = async (req, res) => {
    try {
        const [cartDetails] = await sequelize.query(`
            SELECT * FROM cart_details 
            WHERE cart_id = :cartId
        `, {
            replacements: { cartId: req.params.cartId }
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
        const [cartDetails] = await sequelize.query(`
            SELECT * FROM cart_details 
            WHERE user_email = :userEmail
        `, {
            replacements: { userEmail: req.params.userEmail }
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
        const [cartDetails] = await sequelize.query(`
            SELECT * FROM cart_details 
            WHERE total_price > :minTotal
        `, {
            replacements: { minTotal }
        });
        res.json(cartDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 