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
      username: "string",
      email: "string",
      password: "string",
    },

  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);