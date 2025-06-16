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
    },
    {
      name: "Cart",
      description: "Shopping cart management endpoints",
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
    Cart: {
      id: 1,
      userId: 1,
      isActive: true,
      createdAt: "2024-03-20T10:00:00Z",
      updatedAt: "2024-03-20T10:00:00Z",
      CartItems: [
        {
          id: 1,
          cartId: 1,
          productId: 1,
          quantity: 2,
          Product: {
            id: 1,
            name: "Épée de Mithril",
            price: 2500.00,
            imageUrl: "/images/epee-mithril.jpg"
          }
        }
      ]
    },
    CartItem: {
      id: 1,
      cartId: 1,
      productId: 1,
      quantity: 2,
      createdAt: "2024-03-20T10:00:00Z",
      updatedAt: "2024-03-20T10:00:00Z"
    }
  },
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "JWT token. Format: Bearer <token>"
    }
  }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);