const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./userModel');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'carts',
    timestamps: true
});

// Association avec User
Cart.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Cart, { foreignKey: 'userId' });

module.exports = Cart; 