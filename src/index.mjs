// src/index.mjs

// Importa las dependencias principales | Import main dependencies
import express from 'express';
import userRoutes from './modules/users/user.controller.mjs';
import transactionRoutes from './modules/transactions/transaction.controller.mjs';
import setupSwagger from '../docs/swagger.mjs'; // Importa Swagger desde la nueva ruta y extensión

const app = express();
app.use(express.json()); // Permite recibir y procesar JSON | Allows receiving and processing JSON

// Monta las rutas de usuarios y transacciones | Mount user and transaction routes
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);

// Configura Swagger | Setup Swagger
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`); // Server listening on port
  console.log(`Swagger docs en http://localhost:${PORT}/api-docs`); // <--- Muestra la URL de Swagger
});
