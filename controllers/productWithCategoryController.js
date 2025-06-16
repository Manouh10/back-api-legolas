const sequelize = require('../config/db');

// Get all products with categories
exports.getAllProductsWithCategories = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT * FROM products_with_category
        `);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product with category by ID
exports.getProductWithCategoryById = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT * FROM products_with_category 
            WHERE id = :id
        `, {
            replacements: { id: req.params.id }
        });
        
        if (!products.length) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT * FROM products_with_category 
            WHERE category_slug = :categorySlug
        `, {
            replacements: { categorySlug: req.params.categorySlug }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get products in stock
exports.getProductsInStock = async (req, res) => {
    try {
        const [products] = await sequelize.query(`
            SELECT * FROM products_with_category 
            WHERE stock_quantity > 0
        `);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 