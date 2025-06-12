const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const userController = {
    // Inscription
    async register(req, res) {
        try {
            const user = await User.create(req.body);
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            res.status(201).json({
                user,
                token
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: error.errors[0].message });
            }
            res.status(400).json({ message: error.message });
        }
    },

    // Connexion
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user || !(await user.checkPassword(password))) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            res.json({
                user,
                token
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Obtenir tous les utilisateurs
    async getUsers(req, res) {
        try {
           /* const users = await User.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(users);*/
             res.json("ahaaaaaaa");
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Obtenir un utilisateur par ID
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Mettre à jour un utilisateur
    async updateUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const { username, email } = req.body;
            await user.update({ username, email });
            
            res.json(user);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: error.errors[0].message });
            }
            res.status(400).json({ message: error.message });
        }
    },

    // Supprimer un utilisateur
    async deleteUser(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            await user.destroy();
            res.json({ message: 'Utilisateur supprimé avec succès' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = userController; 