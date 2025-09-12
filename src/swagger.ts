import { Application } from "express";

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "My API", version: "1.0.0" },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};


const specs = swaggerJsdoc(options);

module.exports = (app: Application) => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
};
