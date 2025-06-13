const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "API Test",
    description: "Documentation générée automatiquement",
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    {
      name: "Users",
      description: "Users management endpoints",
    },
    {
      name: "Products",
      description: "Products management endpoints",
    }
  ],
  basePath: "/api",
  definitions: {
    User: {
      email: "user@example.com",
      password_hash: "string_hachée",
      first_name: "Jean",
      last_name: "Dupont",
    },
    ProductOfTheDay: {
      id: 1,
      name: "Élixir de guérison elfique",
      description: "Potion rare concoctée par les guérisseurs elfes",
      price: 300.00,
      currency: "GAR",
      stock_quantity: 40,
      is_product_of_day: true,
      image_url: "/images/elixir-guerison-elfique.jpg",
      product_ref: "ENC-109",
      category_name: "Potions et Élixirs",
      category_slug: "potions-elixirs",
      category_description: "Potions magiques et élixirs de guérison"
    }
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);