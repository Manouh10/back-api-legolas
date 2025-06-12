// /full/path/to/your/project/mon-projet-backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue !' });
});

const PORT = process.env.PORT || 3000;

// Synchronisation de la base de données et démarrage du serveur
sequelize.sync()
    .then(() => {
        console.log('Base de données synchronisée');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur de synchronisation de la base de données:', err);
    });
