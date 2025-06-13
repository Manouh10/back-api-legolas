const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { body } = require("express-validator");

// Validation pour l'inscription
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Le nom d'utilisateur doit contenir au moins 3 caractères"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
];

router.post("/register", registerValidation, (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "User registration endpoint"
  // #swagger.path = "/users/register"
  /* #swagger.requestBody = {
    required: true,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    username: { type: "string", example: "john_doe" },
                    email: { type: "string", example: "john_doe@gmail.com" },
                    password: { type: "string", example: "password123" }
                },
                required: ["username", "email", "password"]
            }
        }
    }
} */
  userController.register(req, res);
});

router.post("/login", (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "User login endpoint"
  // #swagger.path = "/users/login"
  userController.login(req, res);
});
router.get("/", auth, (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "Récupérer la liste des utilisateurs"
  // #swagger.path = "/users/"
  userController.getUsers(req, res);
});

router.get("/:id", auth, (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "Récupérer un utilisateur par son ID"
  // #swagger.path = "/users/{id}"
  userController.getUserById(req, res);
});

router.put("/:id", auth, (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "Mettre à jour un utilisateur"
  // #swagger.path = "/users/{id}"
  userController.updateUser(req, res);
});

router.delete("/:id", auth, (req, res) => {
  // #swagger.tags = ["Users"]
  // #swagger.description = "Supprimer un utilisateur"
  // #swagger.path = "/users/{id}"
  userController.deleteUser(req, res);
});

module.exports = router;
