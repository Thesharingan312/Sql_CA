// Import required libraries | Importar bibliotecas necesarias
import express from 'express';
import mysql from 'mysql2';

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
 * /users/{id}:
 *   get:
 *     description: Get a specific user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Get a specific user by ID | Obtener un usuario específico por ID
app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
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
// ROUTES FOR TRANSACTION TYPES | RUTAS PARA TIPOS DE TRANSACCIONES
// =======================

/**
 * @swagger
 * /transaction-types:
 *   get:
 *     description: Get all transaction types
 *     responses:
 *       200:
 *         description: Returns all transaction types
 *       500:
 *         description: Server error
 */
// Get all transaction types (READ) | Obtener todos los tipos de transacciones (LEER)
app.get('/transaction-types', (req, res) => {
  db.query('SELECT * FROM transaction_types', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /transaction-types/{id}:
 *   get:
 *     description: Get a specific transaction type by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the transaction type
 *       404:
 *         description: Transaction type not found
 *       500:
 *         description: Server error
 */
// Get a specific transaction type by ID | Obtener un tipo de transacción específico por ID
app.get('/transaction-types/:id', (req, res) => {
    const { id } = req.params;
  db.query('SELECT * FROM transaction_types WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Transaction type not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /transaction-types:
 *   post:
 *     description: Create a new transaction type
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
 *         description: Transaction type created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new transaction type (CREATE) | Crear un nuevo tipo de transacción (CREAR)
app.post('/transaction-types', (req, res) => {
    const { name } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!name) {
    return res.status(400).json({ error: 'Missing required field (name)' });
    }

    db.query(
    'INSERT INTO transaction_types (name) VALUES (?)',
    [name],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    }
    );
});

/**
 * @swagger
 * /transaction-types/{id}:
 *   put:
 *     description: Update an existing transaction type
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
 *         description: Transaction type updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing transaction type (UPDATE) | Actualizar un tipo de transacción existente (ACTUALIZAR)
app.put('/transaction-types/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (name === undefined) {
    return res.status(400).json({ error: 'No fields to update were sent' });
    }

    db.query(
    'UPDATE transaction_types SET name = ? WHERE id = ?',
    [name, id],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Transaction type updated' });
    }
    );
});

/**
 * @swagger
 * /transaction-types/{id}:
 *   delete:
 *     description: Delete a transaction type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction type deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a transaction type by ID (DELETE) | Eliminar un tipo de transacción por ID (ELIMINAR)
app.delete('/transaction-types/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM transaction_types WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Transaction type deleted' });
    });
});

// =======================
// ROUTES FOR SAVING TYPES | RUTAS PARA TIPOS DE AHORROS
// =======================

/**
 * @swagger
 * /saving-types:
 *   get:
 *     description: Get all saving types
 *     responses:
 *       200:
 *         description: Returns all saving types
 *       500:
 *         description: Server error
 */
// Get all saving types (READ) | Obtener todos los tipos de ahorros (LEER)
app.get('/saving-types', (req, res) => {
  db.query('SELECT * FROM saving_types', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /saving-types/{id}:
 *   get:
 *     description: Get a specific saving type by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the saving type
 *       404:
 *         description: Saving type not found
 *       500:
 *         description: Server error
 */
// Get a specific saving type by ID | Obtener un tipo de ahorro específico por ID
app.get('/saving-types/:id', (req, res) => {
    const { id } = req.params;
  db.query('SELECT * FROM saving_types WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Saving type not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /saving-types:
 *   post:
 *     description: Create a new saving type
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
 *         description: Saving type created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new saving type (CREATE) | Crear un nuevo tipo de ahorro (CREAR)
app.post('/saving-types', (req, res) => {
    const { name } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!name) {
    return res.status(400).json({ error: 'Missing required field (name)' });
    }

    db.query(
    'INSERT INTO saving_types (name) VALUES (?)',
    [name],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    }
    );
});

/**
 * @swagger
 * /saving-types/{id}:
 *   put:
 *     description: Update an existing saving type
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
 *         description: Saving type updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing saving type (UPDATE) | Actualizar un tipo de ahorro existente (ACTUALIZAR)
app.put('/saving-types/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (name === undefined) {
    return res.status(400).json({ error: 'No fields to update were sent' });
    }

    db.query(
    'UPDATE saving_types SET name = ? WHERE id = ?',
    [name, id],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Saving type updated' });
    }
    );
});

/**
 * @swagger
 * /saving-types/{id}:
 *   delete:
 *     description: Delete a saving type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving type deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a saving type by ID (DELETE) | Eliminar un tipo de ahorro por ID (ELIMINAR)
app.delete('/saving-types/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM saving_types WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Saving type deleted' });
    });
});

// =======================
// ROUTES FOR BUDGET CATEGORIES | RUTAS PARA CATEGORÍAS DE PRESUPUESTOS
// =======================

/**
 * @swagger
 * /budget-categories:
 *   get:
 *     description: Get all budget categories
 *     responses:
 *       200:
 *         description: Returns all budget categories
 *       500:
 *         description: Server error
 */
// Get all budget categories (READ) | Obtener todas las categorías de presupuestos (LEER)
app.get('/budget-categories', (req, res) => {
  db.query('SELECT * FROM budget_categories', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

/**
 * @swagger
 * /budget-categories/{id}:
 *   get:
 *     description: Get a specific budget category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the budget category
 *       404:
 *         description: Budget category not found
 *       500:
 *         description: Server error
 */
// Get a specific budget category by ID | Obtener una categoría de presupuesto específica por ID
app.get('/budget-categories/:id', (req, res) => {
    const { id } = req.params;
  db.query('SELECT * FROM budget_categories WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Budget category not found' });
    res.json(results[0]);
    });
});

/**
 * @swagger
 * /budget-categories:
 *   post:
 *     description: Create a new budget category
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
 *         description: Budget category created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
// Create a new budget category (CREATE) | Crear una nueva categoría de presupuesto (CREAR)
app.post('/budget-categories', (req, res) => {
    const { name } = req.body;

  // Validate required fields | Validar campos requeridos
    if (!name) {
    return res.status(400).json({ error: 'Missing required field (name)' });
    }

    db.query(
    'INSERT INTO budget_categories (name) VALUES (?)',
    [name],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, name });
    }
    );
});

/**
 * @swagger
 * /budget-categories/{id}:
 *   put:
 *     description: Update an existing budget category
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
 *         description: Budget category updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
// Update an existing budget category (UPDATE) | Actualizar una categoría de presupuesto existente (ACTUALIZAR)
app.put('/budget-categories/:id', (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (name === undefined) {
    return res.status(400).json({ error: 'No fields to update were sent' });
    }

    db.query(
    'UPDATE budget_categories SET name = ? WHERE id = ?',
    [name, id],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Budget category updated' });
    }
    );
});

/**
 * @swagger
 * /budget-categories/{id}:
 *   delete:
 *     description: Delete a budget category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget category deleted successfully
 *       500:
 *         description: Server error
 */
// Delete a budget category by ID (DELETE) | Eliminar una categoría de presupuesto por ID (ELIMINAR)
app.delete('/budget-categories/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM budget_categories WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Budget category deleted' });
    });
});

// =======================
// ADDITIONAL USEFUL ENDPOINTS | ENDPOINTS ADICIONALES ÚTILES
// =======================

/**
 * @swagger
 * /users/{userId}/stats:
 *   get:
 *     description: Get comprehensive financial statistics for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns user financial statistics
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Get comprehensive user statistics | Obtener estadísticas completas del usuario
app.get('/users/:userId/stats', (req, res) => {
    const { userId } = req.params;
    const { month } = req.query;

  // Check if user exists | Verificar si el usuario existe
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, userResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userResults.length === 0) return res.status(404).json({ error: 'User not found' });
    
    // Collect financial statistics | Recopilar estadísticas financieras
    const stats = {};
    let monthFilter = '';
    let monthValue = [];
    
    if (month) {
        monthFilter = 'AND DATE_FORMAT(date, "%Y-%m") = ?';
        monthValue.push(month);
    }
    
    // Get income totals | Obtener totales de ingresos
    db.query(
        `SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income' ${monthFilter}`,
        [userId, ...monthValue],
        (err, incomeResults) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalIncome = incomeResults[0].total || 0;
        
        // Get expense totals | Obtener totales de gastos
        db.query(
            `SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense' ${monthFilter}`,
            [userId, ...monthValue],
            (err, expenseResults) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalExpenses = expenseResults[0].total || 0;
            
            // Get savings information | Obtener información de ahorros
            db.query(
                `SELECT SUM(amount) as total FROM savings WHERE user_id = ? ${monthFilter ? monthFilter.replace('date', 'created_at') : ''}`,
                [userId, ...monthValue],
                (err, savingsResults) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.totalSavings = savingsResults[0].total || 0;
                
                // Get budget information | Obtener información de presupuestos
                db.query(
                    `SELECT SUM(amount) as totalBudgeted, SUM(saving_amount) as totalBudgetedSavings 
                    FROM budgets WHERE user_id = ? ${monthFilter}`,
                    [userId, ...monthValue],
                    (err, budgetResults) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.totalBudgeted = budgetResults[0].totalBudgeted || 0;
                    stats.totalBudgetedSavings = budgetResults[0].totalBudgetedSavings || 0;
                    
                    // Calculate remaining budget | Calcular presupuesto restante
                    stats.remainingBudget = stats.totalBudgeted - stats.totalExpenses;
                    
                    // Calculate net worth | Calcular patrimonio neto
                    stats.netWorth = stats.totalIncome - stats.totalExpenses + stats.totalSavings;
                    
                    // Get category breakdown for expenses | Obtener desglose por categoría para gastos
                    db.query(
                        `SELECT c.id, c.name, SUM(t.amount) as total 
                        FROM transactions t 
                        JOIN budget_categories c ON t.category_id = c.id 
                        WHERE t.user_id = ? AND t.type = 'expense' ${monthFilter}
                        GROUP BY c.id, c.name`,
                        [userId, ...monthValue],
                        (err, categoryResults) => {
                        if (err) return res.status(500).json({ error: err.message });
                        stats.expensesByCategory = categoryResults;
                        
                        // Return complete stats | Devolver estadísticas completas
                        res.json({
                            userId: parseInt(userId),
                            period: month || 'all-time',
                            statistics: stats
                        });
                        }
                    );
                    }
                );
                }
            );
            }
        );
        }
    );
    });
});

/**
 * @swagger
 * /reports/monthly:
 *   get:
 *     description: Get monthly financial report for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns monthly financial report
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
// Get monthly financial report | Obtener informe financiero mensual
app.get('/reports/monthly', (req, res) => {
    const { user_id, year } = req.query;

    if (!user_id) {
    return res.status(400).json({ error: 'Missing required parameter (user_id)' });
    }

    const currentYear = year || new Date().getFullYear();

  // Query to get monthly data | Consulta para obtener datos mensuales
    const query = `
    SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ? AND YEAR(date) = ?
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month ASC
    `;

    db.query(query, [user_id, currentYear], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Get savings data | Obtener datos de ahorros
    const savingsQuery = `
        SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(amount) as total_savings
        FROM savings
        WHERE user_id = ? AND YEAR(created_at) = ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    `;
    
    db.query(savingsQuery, [user_id, currentYear], (err, savingsResults) => {
        if (err) return res.status(500).json({ error: err.message });

      // Merge transaction and savings data | Combinar datos de transacciones y ahorros
        const monthlyData = results.map(month => {
        const savingEntry = savingsResults.find(saving => saving.month === month.month);
        return {
            month: month.month,
            income: parseFloat(month.income) || 0,
            expenses: parseFloat(month.expenses) || 0,
            savings: savingEntry ? parseFloat(savingEntry.total_savings) : 0,
            net: (parseFloat(month.income) || 0) - (parseFloat(month.expenses) || 0)
        };
        });
    
      // Add any savings entries that don't have corresponding transaction entries
        savingsResults.forEach(saving => {
        if (!monthlyData.some(month => month.month === saving.month)) {
            monthlyData.push({
            month: saving.month,
            income: 0,
            expenses: 0,
            savings: parseFloat(saving.total_savings) || 0,
            net: 0
            });
        }
        });

      // Sort by month | Ordenar por mes
        monthlyData.sort((a, b) => a.month.localeCompare(b.month));

      // Calculate totals | Calcular totales
        const totals = monthlyData.reduce((acc, curr) => {
        acc.totalIncome += curr.income;
        acc.totalExpenses += curr.expenses;
        acc.totalSavings += curr.savings;
        acc.totalNet += curr.net;
        return acc;
        }, { totalIncome: 0, totalExpenses: 0, totalSavings: 0, totalNet: 0 });
    
        res.json({
        userId: parseInt(user_id),
        year: parseInt(currentYear),
        monthly: monthlyData,
        totals
        });
    });
    });
});

/**
 * @swagger
 * /reports/category-analysis:
 *   get:
 *     description: Get expense category analysis for a user
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns category analysis report
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
// Get expense category analysis | Obtener análisis de categorías de gastos
app.get('/reports/category-analysis', (req, res) => {
    const { user_id, month } = req.query;

    if (!user_id) {
    return res.status(400).json({ error: 'Missing required parameter (user_id)' });
    }

    let timeFilter = '';
    let params = [user_id];

    if (month) {
    timeFilter = 'AND DATE_FORMAT(t.date, "%Y-%m") = ?';
    params.push(month);
}

    const query = `
    SELECT 
        c.id as category_id,
        c.name as category_name,
        SUM(t.amount) as total_spent,
        COUNT(t.id) as transaction_count,
        (
        SELECT amount 
        FROM budgets 
        WHERE user_id = ? AND category_id = c.id ${month ? 'AND DATE_FORMAT(date, "%Y-%m") = ?' : ''} 
        LIMIT 1
        ) as budget_amount
    FROM transactions t
    JOIN budget_categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.type = 'expense' ${timeFilter}
    GROUP BY c.id, c.name
    ORDER BY total_spent DESC
    `;

    const queryParams = month ? [user_id, month, user_id, month] : [user_id, user_id];

    db.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Calculate percentages and budget status | Calcular porcentajes y estado del presupuesto
    const totalExpenses = results.reduce((sum, category) => 
        sum + parseFloat(category.total_spent || 0), 0);
    
    const categoriesWithAnalysis = results.map(category => {
        const totalSpent = parseFloat(category.total_spent || 0);
        const budgetAmount = parseFloat(category.budget_amount || 0);
        
        return {
        ...category,
        percentage_of_total: totalExpenses ? ((totalSpent / totalExpenses) * 100).toFixed(2) + '%' : '0%',
        budget_status: budgetAmount ? 
            (totalSpent <= budgetAmount ? 'within_budget' : 'over_budget') : 'no_budget',
        budget_remaining: budgetAmount ? (budgetAmount - totalSpent).toFixed(2) : null,
        budget_usage_percentage: budgetAmount ? 
          ((totalSpent / budgetAmount) * 100).toFixed(2) + '%' : null
        };
    });
    
    res.json({
        userId: parseInt(user_id),
        period: month || 'all-time',
        total_expenses: totalExpenses.toFixed(2),
        categories: categoriesWithAnalysis
    });
    });
});

/**
 * @swagger
 * /reports/saving-goals:
 *   get:
 *     description: Track saving goals progress
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns saving goals progress
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
// Track saving goals progress | Seguimiento del progreso de objetivos de ahorro
app.get('/reports/saving-goals', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'Missing required parameter (user_id)' });
    }

    // Get budgeted savings by category | Obtener ahorros presupuestados por categoría
    const query = `
    SELECT 
        c.id as category_id,
        c.name as category_name,
        b.saving_amount as target_amount,
        (
            SELECT SUM(amount) 
            FROM savings 
            WHERE user_id = ? AND type_id = c.id
        ) as current_amount
    FROM budgets b
    JOIN budget_categories c ON b.category_id = c.id
    WHERE b.user_id = ? AND b.saving_amount > 0
    GROUP BY c.id, c.name, b.saving_amount
    `;

    db.query(query, [user_id, user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Calculate progress percentages | Calcular porcentajes de progreso
        const goals = results.map(row => {
            const current = parseFloat(row.current_amount || 0);
            const target = parseFloat(row.target_amount || 0);

            return {
                category_id: row.category_id,
                category_name: row.category_name,
                target_amount: target,
                current_amount: current,
                progress: target > 0 ? ((current / target) * 100).toFixed(2) + '%' : '0%'
            };
        });

        res.json({
            userId: parseInt(user_id),
            saving_goals: goals
        });
    });
});
// =======================
// START THE SERVER | INICIAR EL SERVIDOR
// =======================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});