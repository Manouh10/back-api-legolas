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
      description: " Users management endpoints",
    },
  ],
  basePath: "/api",
  definitions: {
    User: {
      email: "user@example.com",
      password_hash: "string_hachée",
      first_name: "Jean",
      last_name: "Dupont",
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);