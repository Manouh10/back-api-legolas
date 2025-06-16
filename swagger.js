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
    Product: {
      id: 1,
      name: "Épée de Mithril",
      description: "Lame forgée dans le mithril des mines de la Moria",
      price: 2500.00,
      currency: "GAR",
      category_id: 2,
      image_url: "/images/epee-mithril.jpg",
      stock_quantity: 3,
      is_product_of_day: false,
      product_ref: "ARM-045",
      created_at: "2024-03-20T10:00:00Z",
      updated_at: "2024-03-20T10:00:00Z"
    },
    ProductWithCategory: {
      id: 1,
      name: "Épée de Mithril",
      description: "Lame forgée dans le mithril des mines de la Moria",
      price: 2500.00,
      currency: "GAR",
      stock_quantity: 3,
      is_product_of_day: false,
      image_url: "/images/epee-mithril.jpg",
      product_ref: "ARM-045",
      category_name: "Armes et Armures",
      category_slug: "armes-armures",
      category_description: "Épées, boucliers, armures et équipements de combat"
    },
    ProductOfTheDay: {
      $ref: '#/definitions/ProductWithCategory'
    }
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);