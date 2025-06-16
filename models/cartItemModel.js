const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Cart = require('./cartModel');
const Produit = require('./produitModel');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'carts',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    }
}, {
    tableName: 'cart_items',
    timestamps: true
});

// Associations
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId' });

CartItem.belongsTo(Produit, { foreignKey: 'productId' });
Produit.hasMany(CartItem, { foreignKey: 'productId' });

module.exports = CartItem; 