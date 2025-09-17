"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
module.exports = (app) => {
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
};
//# sourceMappingURL=swagger.js.map