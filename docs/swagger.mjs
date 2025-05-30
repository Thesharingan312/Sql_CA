// docs/swagger.mjs

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneyShield API',
      version: '0.1.7',
      description: 'Thesharingan312 API documentation for MoneyShield project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/modules/users/*.mjs', './src/modules/transactions/*.mjs', './src/modules/profiles/*.mjs', './src/modules/categories/*.mjs',
  './src/modules/transaction_types/*.mjs', './src/modules/budgets/*.mjs', './src/modules/savings_types/*.mjs', './src/modules/savings/*.mjs' ], // Rutas de los archivos que contienen las anotaciones Swagger | Paths to the files containing Swagger annotations
  // Cambia la ruta según la ubicación de tus archivos | Change the path according to the location of your files
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
