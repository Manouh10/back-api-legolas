// models/panierModel.js
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel"); // Importez le modèle User

const Panier = sequelize.define(
  "Panier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Chaque utilisateur ne peut avoir qu'un seul panier actif
      references: {
        model: User, // Référence le modèle User
        key: "id", // Référence la colonne 'id' dans la table 'users'
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: "paniers",
  }
);

module.exports = Panier;
