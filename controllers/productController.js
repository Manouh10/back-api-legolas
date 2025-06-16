// controllers/produitController.js
const Produit = require("../models/produitModel");
const sequelize = require("../config/db"); // Importez l'instance de sequelize pour les transactions
const { Sequelize } = require("sequelize"); // Importez Sequelize pour les opérateurs (comme Op.ne)
const pool = require('../config/db');
const produitController = {
  /**
   * @swagger
   * /api/products:
   * get:
   * tags:
   * - Produits
   * summary: Récupérer tous les produits
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Liste de tous les produits.
   * content:
   * application/json:
   * schema:
   * type: array
   * items:
   * $ref: '#/components/schemas/Produit'
   * 500:
   * description: Erreur serveur.
   */
  async getAllProducts(req, res) {
    try {
      const produits = await Produit.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json(produits);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération des produits." });
    }
  },

  /**
   * @swagger
   * /api/products/{id}:
   * get:
   * tags:
   * - Produits
   * summary: Récupérer un produit par ID
   * parameters:
   * - in: path
   * name: id
   * schema:
   * type: integer
   * required: true
   * description: ID du produit.
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Détails du produit.
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/Produit'
   * 404:
   * description: Produit non trouvé.
   * 500:
   * description: Erreur serveur.
   */
  async getProductById(req, res) {
    try {
      const produit = await Produit.findByPk(req.params.id);
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }
      res.json(produit);
    } catch (error) {
      console.error("Erreur lors de la récupération du produit par ID:", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération du produit." });
    }
  },

  /**
   * @swagger
   * /api/products:
   * post:
   * tags:
   * - Produits
   * summary: Créer un nouveau produit (Admin seulement)
   * security:
   * - BearerAuth: []
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * required:
   * - name
   * - price
   * - stock
   * properties:
   * name:
   * type: string
   * example: "T-shirt Geek"
   * description:
   * type: string
   * example: "Un t-shirt 100% coton pour les fans de développement."
   * price:
   * type: number
   * format: float
   * example: 25.99
   * stock:
   * type: integer
   * example: 100
   * imageUrl:
   * type: string
   * example: "https://example.com/tshirt-geek.jpg"
   * isProductOfTheDay:
   * type: boolean
   * example: false
   * responses:
   * 201:
   * description: Produit créé avec succès.
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/Produit'
   * 400:
   * description: Données invalides ou produit déjà existant.
   * 403:
   * description: Accès refusé (non-administrateur).
   * 500:
   * description: Erreur serveur.
   */
  async createProduct(req, res) {
    try {
      const { name, description, price, stock, imageUrl, isProductOfTheDay } = req.body;

      // Démarre une transaction pour assurer l'atomicité
      const newProduit = await sequelize.transaction(async (t) => {
        if (isProductOfTheDay) {
          // Si un nouveau produit est défini comme produit du jour, désactive tous les autres produits
          await Produit.update(
            { isProductOfTheDay: false },
            {
              where: { isProductOfTheDay: true },
              transaction: t, // Exécute la mise à jour dans la même transaction
            }
          );
        }

        const product = await Produit.create(
          { name, description, price, stock, imageUrl, isProductOfTheDay },
          { transaction: t } // Exécute la création dans la même transaction
        );
        return product;
      });

      res.status(201).json(newProduit);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: "Un produit avec ce nom existe déjà." });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Erreur lors de la création du produit:", error);
      res.status(500).json({ message: "Erreur serveur lors de la création du produit." });
    }
  },

  /**
   * @swagger
   * /api/products/{id}:
   * put:
   * tags:
   * - Produits
   * summary: Mettre à jour un produit existant (Admin seulement)
   * parameters:
   * - in: path
   * name: id
   * schema:
   * type: integer
   * required: true
   * description: ID du produit à mettre à jour.
   * security:
   * - BearerAuth: []
   * requestBody:
   * required: true
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * name:
   * type: string
   * example: "T-shirt Geek V2"
   * description:
   * type: string
   * example: "Une nouvelle version améliorée."
   * price:
   * type: number
   * format: float
   * example: 29.99
   * stock:
   * type: integer
   * example: 90
   * imageUrl:
   * type: string
   * example: "https://example.com/tshirt-geek-v2.jpg"
   * isProductOfTheDay:
   * type: boolean
   * example: true
   * responses:
   * 200:
   * description: Produit mis à jour avec succès.
   * content:
   * application/json:
   * schema:
   * $ref: '#/components/schemas/Produit'
   * 400:
   * description: Données invalides ou produit déjà existant.
   * 403:
   * description: Accès refusé (non-administrateur).
   * 404:
   * description: Produit non trouvé.
   * 500:
   * description: Erreur serveur.
   */
  async updateProduct(req, res) {
    try {
      const { name, description, price, stock, imageUrl, isProductOfTheDay } = req.body;

      const produit = await Produit.findByPk(req.params.id);
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }

      // Démarre une transaction pour assurer l'atomicité
      const updatedProduit = await sequelize.transaction(async (t) => {
        if (isProductOfTheDay && !produit.isProductOfTheDay) {
          // Si ce produit est maintenant défini comme produit du jour et ne l'était pas avant,
          // désactive tous les autres produits du jour
          await Produit.update(
            { isProductOfTheDay: false },
            {
              where: {
                isProductOfTheDay: true,
                id: { [Sequelize.Op.ne]: req.params.id }, // Exclut le produit actuel
              },
              transaction: t, // Exécute la mise à jour dans la même transaction
            }
          );
        } else if (!isProductOfTheDay && produit.isProductOfTheDay) {
          // Si ce produit était le produit du jour et est maintenant désactivé,
          // on ne fait rien de spécial, on le désactive simplement.
          // La logique d'avoir toujours un produit du jour peut être ajoutée ici si nécessaire.
        }

        await produit.update({ name, description, price, stock, imageUrl, isProductOfTheDay }, { transaction: t });
        return produit;
      });

      res.json(updatedProduit);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: "Un autre produit avec ce nom existe déjà." });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Erreur lors de la mise à jour du produit:", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour du produit." });
    }
  },

  /**
   * @swagger
   * /api/products/{id}:
   * delete:
   * tags:
   * - Produits
   * summary: Supprimer un produit (Admin seulement)
   * parameters:
   * - in: path
   * name: id
   * schema:
   * type: integer
   * required: true
   * description: ID du produit à supprimer.
   * security:
   * - BearerAuth: []
   * responses:
   * 200:
   * description: Produit supprimé avec succès.
   * 403:
   * description: Accès refusé (non-administrateur).
   * 404:
   * description: Produit non trouvé.
   * 500:
   * description: Erreur serveur.
   */
  async deleteProduct(req, res) {
    try {
      const produit = await Produit.findByPk(req.params.id);
      if (!produit) {
        return res.status(404).json({ message: "Produit non trouvé." });
      }

      await produit.destroy();
      res.json({ message: "Produit supprimé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      res.status(500).json({ message: "Erreur serveur lors de la suppression du produit." });
    }
  },

  /**
   * @swagger
   * /api/products/product-of-the-day:
   * get:
   * tags:
   * - Produits
   * summary: Récupère le produit du jour
   * description: Retourne le produit marqué comme produit du jour
   * responses:
   * 200:
   * description: Produit du jour trouvé avec succès
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * success:
   * type: boolean
   * example: true
   * data:
   * $ref: '#/components/schemas/Produit' # Référence au schéma Produit
   * 404:
   * description: Aucun produit du jour n'est disponible
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * success:
   * type: boolean
   * example: false
   * message:
   * type: string
   * example: "Aucun produit du jour n'est disponible"
   * 500:
   * description: Erreur serveur
   * content:
   * application/json:
   * schema:
   * type: object
   * properties:
   * success:
   * type: boolean
   * example: false
   * message:
   * type: string
   * example: "Erreur lors de la récupération du produit du jour"
   */
   

   async getProductOfTheDay (req, res)  {
    try {
        const result = await pool.query('SELECT * FROM product_of_the_day');

        const rows = result[0]; // Correction ici

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Aucun produit du jour n'est disponible"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du produit du jour:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
},


};

module.exports = produitController;
