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

// --- CORRECCIÓN AQUÍ ---
// Aumentamos el límite para recibir imágenes en Base64
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// -----------------------

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

// --- REGISTRO DE ALIADOS ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  const values = [nombre_local, nit, correo, direccion, password];

  pool.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "NIT o correo ya registrados." });
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.status(201).json({ mensaje: "Éxito", aliado: { id: result.insertId, nombre_local } });
  });
});

// --- LOGIN MULTI-ROL ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  if (role === 'vendor') {
    const sql = "SELECT * FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error servidor" });
      if (results.length > 0) {
        res.status(200).json({ mensaje: "OK", usuario: { id: results[0].id, nombre: results[0].nombre_local, role: 'vendor' } });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  } else {
    const sql = "SELECT * FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error" });
      if (results.length > 0) {
        res.status(200).json({ mensaje: "OK", usuario: { nombre: results[0].nombre, correo: results[0].correo, role: 'user' } });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  }
});

// --- GESTIÓN DE PRODUCTOS (CON IMAGEN BASE64) ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url } = req.body;

  if (!aliado_id || !nombre) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
  
  pool.query(sql, [
    aliado_id, 
    nombre, 
    Number(precio_original), 
    Number(precio_rescate), 
    Number(stock), 
    imagen_url
  ], (err, result) => {
    if (err) {
      console.error("❌ Error SQL:", err);
      // Si sale error aquí, verifica que la columna sea LONGTEXT
      return res.status(500).json({ error: "No se pudo guardar en la base de datos" });
    }
    res.status(201).json({ mensaje: "Publicado con éxito", id: result.insertId });
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

app.get('/api/productos-todos', (req, res) => {
  const sql = `
    SELECT p.*, a.nombre_local, a.direccion 
    FROM productos_rescate p 
    JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.stock > 0 
    ORDER BY p.id DESC
  `;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al cargar catálogo" });
    res.status(200).json(results);
  });
});

app.get('/api/perfil-aliado/:id', (req, res) => {
  const sql = "SELECT nombre_local, nit, correo_corporativo, direccion FROM aliados WHERE id = ?";
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.status(results.length > 0 ? 200 : 404).json(results[0] || { error: "No existe" });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});