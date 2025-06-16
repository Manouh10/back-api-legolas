// models/produitModel.js
const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/db"); // Assurez-vous que le chemin est correct pour votre configuration de base de données

const Produit = sequelize.define(
  "Produit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Assurez-vous que les noms de produits sont uniques
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // Prix avec 2 décimales
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0, // Le prix ne peut pas être négatif
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0, // Le stock ne peut pas être négatif
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true, // L'URL de l'image est facultative
      defaultValue: "https://placehold.co/300x300/dddddd/000000?text=Produit", // Image par défaut
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
    timestamps: true, // Sequelize gère automatiquement createdAt et updatedAt
    underscored: true, // Utilise snake_case pour les noms de colonnes dans la DB (ex: imageUrl -> image_url)
    tableName: "produits", // Nom de la table dans la base de données
  }
);

module.exports = Produit;
