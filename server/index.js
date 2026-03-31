const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuraciones
app.use(cors()); // Permite que React se comunique con Node
app.use(express.json()); // Permite recibir datos en formato JSON

// Conexión a MariaDB usando los datos del .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Probar conexión
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MariaDB:', err.message);
    return;
  }
  console.log('✅ Conectado a MariaDB con éxito.');
});

// RUTA: Recibir datos del formulario de AprovechApp
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  db.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      console.error("Error al insertar:", err);
      return res.status(500).json({ error: "Error al guardar el usuario" });
    }
    res.status(201).json({ mensaje: "¡Usuario registrado!", id: result.insertId });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});