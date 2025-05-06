const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json()); // Para leer JSON en peticiones POST

// Configura la conexión a tu base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Cambia esto si tu usuario es diferente
    password: 'Mamuelo06m*',         // Pon tu contraseña de MySQL aquí
    database: 'moneyshield'
});

// Prueba la conexión
db.connect(err => {
    if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
    }
    console.log('¡Conexión a MySQL exitosa!');
});

// Ruta de prueba para ver si funciona
app.get('/', (req, res) => {
    res.send('¡API de MoneyShield funcionando!');
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    res.json(results);
    });
});

// Ruta para obtener todos los movimientos
app.get('/movimientos', (req, res) => {
  db.query('SELECT * FROM movimientos', (err, results) => {
    if (err) {
        return res.status(500).json({ error: err.message });
    }
    res.json(results);
    });
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});