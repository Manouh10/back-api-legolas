// /full/path/to/your/project/mon-projet-backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(
    `Serveur local api-docs lancé sur http://localhost:${PORT}/api-docs`
  )
);

app.listen(PORT, () =>
  console.log(
    `Serveur dev api-docs lancé sur https://frodon.onrender.com/api-docs`
  )
);
// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use("/api/users", userRoutes);
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

// Synchronisation de la base de données et démarrage du serveur
sequelize
  .sync()
  .then(() => {
    console.log("Base de données synchronisée");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur de synchronisation de la base de données:", err);
  });
