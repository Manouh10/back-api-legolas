// models/lignePanierModel.js
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const Panier = require("./panierModel"); // Importez le modèle Panier
const Produit = require("./produitModel"); // Importez le modèle Produit

const LignePanier = sequelize.define(
  "LignePanier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    panierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Panier,
        key: "id",
      },
    },
    produitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Produit,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1, // La quantité doit être au moins 1
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
    tableName: "lignes_panier", // Nom de la table de jonction
  }
);

module.exports = LignePanier;
