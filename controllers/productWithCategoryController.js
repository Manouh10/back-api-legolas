const ProductWithCategory = require('../models/ProductWithCategory');

// Get all products with categories
exports.getAllProductsWithCategories = async (req, res) => {
    try {
        const products = await ProductWithCategory.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product with category by ID
exports.getProductWithCategoryById = async (req, res) => {
    try {
        const product = await ProductWithCategory.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await ProductWithCategory.findAll({
            where: {
                category_slug: req.params.categorySlug
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get products in stock
exports.getProductsInStock = async (req, res) => {
    try {
        const products = await ProductWithCategory.findAll({
            where: {
                stock_quantity: {
                    [Op.gt]: 0
                }
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 