// /full/path/to/your/project/mon-projet-backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db"); // Votre instance de Sequelize
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

// Importation des modèles
const User = require("./models/userModel");
const Produit = require("./models/produitModel");
const Panier = require("./models/panierModel");
const LignePanier = require("./models/lignePanierModel");

// Importation des routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const productWithCategoryRoutes = require('./routes/productWithCategoryRoutes');
const cartDetailRoutes = require('./routes/cartDetailRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Définition des associations Sequelize ---

User.hasOne(Panier, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
Panier.belongsTo(User, {
  foreignKey: "userId",
});

Panier.hasMany(LignePanier, {
  foreignKey: "panierId",
  onDelete: "CASCADE",
});
LignePanier.belongsTo(Panier, {
  foreignKey: "panierId",
});

Produit.hasMany(LignePanier, {
  foreignKey: "produitId",
});
LignePanier.belongsTo(Produit, {
  foreignKey: "produitId",
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products-with-category", productWithCategoryRoutes);
app.use("/api/cart-details", cartDetailRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur est survenue !" });
});

// Fonction pour exécuter des requêtes SQL brutes
async function executeRawSql(sql) {
  try {
    await sequelize.query(sql);
    console.log(`Requête SQL exécutée avec succès: ${sql.substring(0, 100)}...`);
  } catch (err) {
    console.error(`Erreur lors de l'exécution de la requête SQL: ${sql.substring(0, 100)}...`, err);
    throw err; // Relancer l'erreur pour que sequelize.sync puisse la gérer
  }
}

// Synchronisation de la base de données et démarrage du serveur
sequelize
  .authenticate() // Teste la connexion à la base de données
  .then(async () => {
    console.log("Connexion à la base de données établie avec succès.");

    // --- Supprimer la vue qui pourrait poser problème lors de l'alteration des tables ---
    // Cette étape est souvent nécessaire car Sequelize peut modifier des colonnes
    // dont la vue dépend, et PostgreSQL empêche ces modifications tant que la vue existe.
    // await executeRawSql('DROP VIEW IF EXISTS cart_details CASCADE;');
    // console.log("Vue 'cart_details' supprimée (si elle existait).");

    // --- Synchroniser les modèles Sequelize ---
    // `alter: true` pour appliquer les changements de schéma
    await sequelize.sync({ alter: true });
    console.log("Base de données synchronisée avec les modèles Sequelize.");

    // --- Note importante : La vue 'cart_details' n'est PAS recréée ici. ---
    // Vous devez vous assurer qu'elle est gérée par un autre mécanisme (ex: migration SQL séparée).

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de synchronisation ou de connexion à la base de données:", err);
  });
