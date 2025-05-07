// Import required libraries | Importar bibliotecas necesarias
const express = require('express');
const mysql = require('mysql2');

// Create the Express application | Crear la aplicación Express
const app = express();
app.use(express.json()); // Allows receiving and processing JSON data | Permite recibir y procesar datos JSON

/**
 * MySQL database connection configuration
 * Configuración de conexión a la base de datos MySQL
 */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mamuelo06m*',
    database: 'moneyshield'
});

/**
 * Handle database connection errors and reconnection
 * Manejar errores de conexión a la base de datos y reconexión
 */
function handleDisconnect() {
    db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
      // Try to reconnect after 5 seconds | Intentar reconectar después de 5 segundos
        setTimeout(handleDisconnect, 5000);
        return;
    }
    console.log('Connected to MySQL!');
    });

  // Handle connection errors | Manejar errores de conexión
    db.on('error', (err) => {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || 
        err.code === 'ECONNREFUSED' || 
        err.code === 'ETIMEDOUT') {
      handleDisconnect(); // Reconnect if connection is lost | Reconectar si se pierde la conexión
    } else {
        throw err;
    }
    });
}

// Initialize connection | Inicializar conexión
handleDisconnect();

/**
 * @swagger
 * /:
 *   get:
 *     description: Test route to check if the server is running
 *     responses:
 *       200:
 *         description: Server is running
 */
// Test route to check if the server is running | Ruta de prueba para verificar si el servidor está funcionando
app.get('/', (req, res) => {
    res.send('MoneyShield API is running!');
});

// =======================
// ROUTES FOR USERS | RUTAS PARA USUARIOS
// =======================

/**
 * @swagger
 * /users:
 *   get:
 *     description: Get all users
 *     responses:
 *       200:
 *         description: Returns all users
 *       500:
 *         description: Server error
 */
// Get all users (READ) | Obtener todos los usuarios (LEER)
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /users:
 *   post:
 *     description: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - email
 *               - password_hash
 *               - profile_id
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new user (CREATE) | Crear un nuevo usuario (CREAR)
app.post('/users', (req, res) => {
    const { first_name, last_name, email, password_hash, profile_id } = req.body;
    if (!first_name || !email || !password_hash || !profile_id) {
        return res.status(400).json({ error: 'Missing required fields (first_name, email, password_hash, profile_id)' });
    }
    db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, profile_id) VALUES (?, ?, ?, ?, ?)',
    [first_name, last_name || null, email, password_hash, profile_id],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, first_name, last_name, email, profile_id });
    }
    );
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     description: Update an existing user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing user (UPDATE) | Actualizar un usuario existente (ACTUALIZAR)
app.put('/users/:id', (req, res) => {
    const { first_name, last_name, email, password_hash, profile_id } = req.body;
    const { id } = req.params;
    let fields = [];
    let values = [];

    if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { fields.push('last_name = ?'); values.push(last_name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (password_hash !== undefined) { fields.push('password_hash = ?'); values.push(password_hash); }
    if (profile_id !== undefined) { fields.push('profile_id = ?'); values.push(profile_id); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update were sent' });
    }

    values.push(id);
    db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values,
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated' });
    }
    );
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     description: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a user by ID (DELETE) | Eliminar un usuario por ID (ELIMINAR)
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
    });
});

// =======================
// ROUTES FOR TRANSACTIONS | RUTAS PARA TRANSACCIONES
// =======================

/**
 * @swagger
 * /transactions:
 *   get:
 *     description: Get all transactions
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns all transactions
 *       500:
 *         description: Server error
 */
// Get all transactions (READ) | Obtener todas las transacciones (LEER)
app.get('/transactions', (req, res) => {
    const { user_id } = req.query;

    let sql = 'SELECT * FROM transactions';
    let values = [];

    if (user_id) {
    sql += ' WHERE user_id = ?';
    values.push(user_id);
    }

    db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     description: Get a specific transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the transaction
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
// Get a specific transaction by ID | Obtener una transacción específica por ID
app.get('/transactions/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM transactions WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     description: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - amount
 *               - type
 *               - category_id
 *               - date
 *     responses:
 *       200:
 *         description: Transaction created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new transaction (CREATE) | Crear una nueva transacción (CREAR)
app.post('/transactions', (req, res) => {
    const { user_id, amount, type, category_id, description, date } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!user_id || !amount || !type || !category_id || !date) {
    return res.status(400).json({ 
        error: 'Missing required fields (user_id, amount, type, category_id, date)' 
    });
    }

    db.query(
    'INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, amount, type, category_id, description || null, date],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
        id: result.insertId, 
        user_id, 
        amount, 
        type, 
        category_id, 
        description, 
        date 
        });
    }
    );
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     description: Update an existing transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing transaction (UPDATE) | Actualizar una transacción existente (ACTUALIZAR)
app.put('/transactions/:id', (req, res) => {
    const { user_id, amount, type, category_id, description, date } = req.body;
    const { id } = req.params;
    
    let fields = [];
    let values = [];

    if (user_id !== undefined) { fields.push('user_id = ?'); values.push(user_id); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (date !== undefined) { fields.push('date = ?'); values.push(date); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update were sent' });
    }

    values.push(id);
    db.query(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
    values,
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Transaction updated' });
    }
    );
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     description: Delete a transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a transaction by ID (DELETE) | Eliminar una transacción por ID (ELIMINAR)
app.delete('/transactions/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM transactions WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaction deleted' });
    });
});

// =======================
// ROUTES FOR BUDGETS | RUTAS PARA PRESUPUESTOS
// =======================

/**
 * @swagger
 * /budgets:
 *   get:
 *     description: Get budgets with optional filtering by user_id
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns all matching budgets
 *       500:
 *         description: Server error
 */
// Get budgets with optional filtering by user_id | Obtener presupuestos con filtrado opcional por user_id
app.get('/budgets', (req, res) => {
    const { user_id } = req.query;

    let sql = 'SELECT * FROM budgets';
    let values = [];

    if (user_id) {
        sql += ' WHERE user_id = ?';
        values.push(user_id);
    }

    db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     description: Get a specific budget by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the budget
 *       404:
 *         description: Budget not found
 *       500:
 *         description: Server error
 */
// Get a specific budget by ID | Obtener un presupuesto específico por ID
app.get('/budgets/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM budgets WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Budget not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /budgets/sum:
 *   get:
 *     description: Sum total saving_amount by user, month, or both
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the total saving amount
 *       500:
 *         description: Server error
 */
// Sum total saving_amount by user, month, or both | Sumar total saving_amount por usuario, mes, o ambos
app.get('/budgets/sum', (req, res) => {
    const { user_id, month } = req.query;

    let sql = 'SELECT SUM(saving_amount) AS total_saving FROM budgets';
    let conditions = [];
    let values = [];

    if (user_id) {
        conditions.push('user_id = ?');
        values.push(user_id);
    }

    if (month) {
        conditions.push('DATE_FORMAT(date, "%Y-%m") = ?');
        values.push(month);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ total_saving: results[0].total_saving || 0 });
    });
});

/**
 * @swagger
 * /budgets:
 *   post:
 *     description: Create a new budget
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - category_id
 *               - amount
 *               - saving_amount
 *               - date
 *     responses:
 *       200:
 *         description: Budget created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new budget (CREATE) | Crear un nuevo presupuesto (CREAR)
app.post('/budgets', (req, res) => {
    const { user_id, category_id, amount, saving_amount, date, note } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!user_id || !category_id || !amount || !saving_amount || !date) {
    return res.status(400).json({ 
        error: 'Missing required fields (user_id, category_id, amount, saving_amount, date)' 
    });
    }

    db.query(
    'INSERT INTO budgets (user_id, category_id, amount, saving_amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
    [user_id, category_id, amount, saving_amount, date, note || null],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
        id: result.insertId, 
        user_id, 
        category_id, 
        amount, 
        saving_amount, 
        date, 
        note 
        });
    }
    );
});

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     description: Update an existing budget
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing budget (UPDATE) | Actualizar un presupuesto existente (ACTUALIZAR)
app.put('/budgets/:id', (req, res) => {
    const { user_id, category_id, amount, saving_amount, date, note } = req.body;
    const { id } = req.params;
    
    let fields = [];
    let values = [];

    if (user_id !== undefined) { fields.push('user_id = ?'); values.push(user_id); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
    if (saving_amount !== undefined) { fields.push('saving_amount = ?'); values.push(saving_amount); }
    if (date !== undefined) { fields.push('date = ?'); values.push(date); }
    if (note !== undefined) { fields.push('note = ?'); values.push(note); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update were sent' });
    }

    values.push(id);
    db.query(
        `UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`,
        values,
        (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Budget updated' });
        }
    );
});

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     description: Delete a budget
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a budget by ID (DELETE) | Eliminar un presupuesto por ID (ELIMINAR)
app.delete('/budgets/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM budgets WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Budget deleted' });
    });
});

// =======================
// ROUTES FOR PROFILES | RUTAS PARA PERFILES
// =======================

/**
 * @swagger
 * /profiles:
 *   get:
 *     description: Get all profiles
 *     responses:
 *       200:
 *         description: Returns all profiles
 *       500:
 *         description: Server error
 */
// Get all profiles (READ) | Obtener todos los perfiles (LEER)
app.get('/profiles', (req, res) => {
  db.query('SELECT * FROM profiles', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     description: Get a specific profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the profile
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
// Get a specific profile by ID | Obtener un perfil específico por ID
app.get('/profiles/:id', (req, res) => {
    const { id } = req.params;
  db.query('SELECT * FROM profiles WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /profiles:
 *   post:
 *     description: Create a new profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Profile created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new profile (CREATE) | Crear un nuevo perfil (CREAR)
app.post('/profiles', (req, res) => {
    const { name } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!name) {
    return res.status(400).json({ error: 'Missing required field (name)' });
    }

    db.query(
    'INSERT INTO profiles (name) VALUES (?)',
    [name],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    }
    );
});

/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     description: Update an existing profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing profile (UPDATE) | Actualizar un perfil existente (ACTUALIZAR)
app.put('/profiles/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (name === undefined) {
    return res.status(400).json({ error: 'No fields to update were sent' });
    }

    db.query(
    'UPDATE profiles SET name = ? WHERE id = ?',
    [name, id],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated' });
    }
    );
});

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     description: Delete a profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a profile by ID (DELETE) | Eliminar un perfil por ID (ELIMINAR)
app.delete('/profiles/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM profiles WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Profile deleted' });
    });
});

// =======================
// ROUTES FOR SAVINGS | RUTAS PARA AHORROS
// =======================

/**
 * @swagger
 * /savings:
 *   get:
 *     description: Get all savings with optional filtering
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: budget_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: transaction_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns all matching savings
 *       500:
 *         description: Server error
 */
// Get all savings with optional filtering | Obtener todos los ahorros con filtrado opcional
app.get('/savings', (req, res) => {
    const { user_id, budget_id, transaction_id } = req.query;

    let sql = 'SELECT * FROM savings';
    let conditions = [];
    let values = [];

    if (user_id) {
    conditions.push('user_id = ?');
    values.push(user_id);
    }

    if (budget_id) {
    conditions.push('budget_id = ?');
    values.push(budget_id);
    }

    if (transaction_id) {
    conditions.push('transaction_id = ?');
    values.push(transaction_id);
    }

    if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /savings/{id}:
 *   get:
 *     description: Get a specific saving by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the saving
 *       404:
 *         description: Saving not found
 *       500:
 *         description: Server error
 */
// Get a specific saving by ID | Obtener un ahorro específico por ID
app.get('/savings/:id', (req, res) => {
    const { id } = req.params;
  db.query('SELECT * FROM savings WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Saving not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /savings/total:
 *   get:
 *     description: Get total savings amount with optional filtering
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns total savings amount
 *       500:
 *         description: Server error
 */
// Get total savings amount | Obtener cantidad total de ahorros
app.get('/savings/total', (req, res) => {
    const { user_id, type } = req.query;

    let sql = 'SELECT SUM(amount) AS total_amount FROM savings';
    let conditions = [];
    let values = [];

    if (user_id) {
    conditions.push('user_id = ?');
    values.push(user_id);
    }

    if (type) {
    conditions.push('type = ?');
    values.push(type);
    }

    if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total_amount: results[0].total_amount || 0 });
    });
});

/**
 * @swagger
 * /savings:
 *   post:
 *     description: Create a new saving
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - amount
 *               - type
 *     responses:
 *       200:
 *         description: Saving created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new saving (CREATE) | Crear un nuevo ahorro (CREAR)
app.post('/savings', (req, res) => {
    const { user_id, budget_id, transaction_id, name, type, amount, notes } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!user_id || !amount || !type) {
    return res.status(400).json({ error: 'Missing required fields (user_id, amount, type)' });
    }

    db.query(
    'INSERT INTO savings (user_id, budget_id, transaction_id, name, type, amount, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [user_id, budget_id || null, transaction_id || null, name || null, type, amount, notes || null],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
        id: result.insertId, 
        user_id, 
        budget_id, 
        transaction_id, 
        name, 
        type, 
        amount, 
        notes, 
        created_at: new Date() 
        });
    }
    );
});

/**
 * @swagger
 * /savings/{id}:
 *   put:
 *     description: Update an existing saving
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Saving updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing saving (UPDATE) | Actualizar un ahorro existente (ACTUALIZAR)
app.put('/savings/:id', (req, res) => {
    const { user_id, budget_id, transaction_id, name, type, amount, notes } = req.body;
    const { id } = req.params;

    let fields = [];
    let values = [];

    if (user_id !== undefined) { fields.push('user_id = ?'); values.push(user_id); }
    if (budget_id !== undefined) { fields.push('budget_id = ?'); values.push(budget_id); }
    if (transaction_id !== undefined) { fields.push('transaction_id = ?'); values.push(transaction_id); }
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes); }

    if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update were sent' });
    }

    values.push(id);
    db.query(
    `UPDATE savings SET ${fields.join(', ')} WHERE id = ?`,
    values,
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Saving updated' });
    }
    );
});

/**
 * @swagger
 * /savings/{id}:
 *   delete:
 *     description: Delete a saving
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a saving by ID (DELETE) | Eliminar un ahorro por ID (ELIMINAR)
app.delete('/savings/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM savings WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Saving deleted' });
    });
});

// =======================
// START THE SERVER | INICIAR EL SERVIDOR
// =======================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});