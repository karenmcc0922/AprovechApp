const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST'],
  credentials: true
})); 

app.use(express.json()); 

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// --- RUTA 3: REGISTRO DE ALIADOS (CORREGIDA) ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;

  // CORRECCIÓN: Usamos 'password_hash' que es como aparece en tu imagen
  const sql = `
    INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const values = [nombre_local, nit, correo, direccion, password];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al registrar aliado:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "El NIT o el correo ya están registrados." });
      }
      return res.status(500).json({ error: "Error en la base de datos: " + err.sqlMessage });
    }
    
    res.status(201).json({ 
      mensaje: "Comercio registrado con éxito.",
      aliado: { id: result.insertId, nombre_local } 
    });
  });
});

// --- RUTA LOGIN (ÚNICA Y CORREGIDA) ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;

  if (role === 'vendor') {
    // CORRECCIÓN: Buscamos en 'password_hash'
    const sql = "SELECT * FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      
      if (results.length > 0) {
        const aliado = results[0];
        res.status(200).json({ 
          mensaje: "Login exitoso", 
          usuario: { id: aliado.id, nombre: aliado.nombre_local, role: 'vendor' } 
        });
      } else {
        res.status(401).json({ error: "Credenciales de comercio incorrectas" });
      }
    });
  } else {
    const sql = "SELECT * FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      
      if (results.length > 0) {
        const usuario = results[0];
        res.status(200).json({ 
          mensaje: "Login exitoso", 
          usuario: { nombre: usuario.nombre, correo: usuario.correo, role: 'user' } 
        });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  }
});

// Rutas de productos (Se mantienen igual ya que parecen correctas)
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock } = req.body;
  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock) VALUES (?, ?, ?, ?, ?)";
  pool.query(sql, [aliado_id, nombre, precio_original, precio_rescate, stock], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al publicar" });
    res.status(201).json({ mensaje: "Publicado", id: result.insertId });
  });
});

app.get('/api/mis-productos/:aliado_id', (req, res) => {
  const { aliado_id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  pool.query(sql, [aliado_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.status(200).json(results);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});