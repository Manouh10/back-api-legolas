const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductWithCategory = sequelize.define('ProductWithCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'GAR'
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_product_of_day: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    image_url: {
        type: DataTypes.STRING(500)
    },
    product_ref: {
        type: DataTypes.STRING(50),
        unique: true
    },
    category_name: {
        type: DataTypes.STRING(100)
    },
    category_slug: {
        type: DataTypes.STRING(100)
    },
    category_description: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'products_with_category',
    timestamps: false
});

module.exports = ProductWithCategory; 