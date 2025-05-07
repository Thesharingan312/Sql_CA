// Import required libraries
const express = require('express');
const mysql = require('mysql2');

// Create the Express application
const app = express();
app.use(express.json()); // Allows receiving and processing JSON data

// MySQL database connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mamuelo06m*',
    database: 'moneyshield'
});

// Try to connect to the database
db.connect(err => {
    if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
    }
    console.log('Connected to MySQL!');
});

// Test route to check if the server is running
app.get('/', (req, res) => {
    res.send('MoneyShield API is running!');
});

// =======================
// ROUTES FOR USERS
// =======================

// Get all users (READ)
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
    });
});

// Create a new user (CREATE)
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

// Update an existing user (UPDATE)
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

// Delete a user by ID (DELETE)
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted' });
    });
});

// =======================
// ROUTES FOR TRANSACTIONS
// =======================

// Get all transactions (READ)
app.get('/transactions', (req, res) => {
  db.query('SELECT * FROM transactions', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
        });
});

// =======================
// ROUTES FOR BUDGETS
// =======================

// Get budgets with optional filtering by user_id
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

// Sum total saving_amount by user, month, or both
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

// =======================
// START THE SERVER
// =======================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
