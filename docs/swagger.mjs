// docs/swagger.mjs

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneyShield API',
      version: '0.1.5',
      description: 'REST API documentation for MoneyShield project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/modules/users/*.mjs', './src/modules/transactions/*.mjs', './src/modules/profiles/*.mjs', './src/modules/categories/*.mjs'], 
  // Cambia la ruta según la ubicación de tus archivos | Change the path according to the location of your files
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
