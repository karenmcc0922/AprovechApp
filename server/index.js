const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10
});

// --- RUTA CORREGIDA (SOLUCIÓN AL PROBLEMA DE VISIBILIDAD) ---
app.get('/api/productos-todos', (req, res) => {
  // Usamos LEFT JOIN en lugar de JOIN. 
  // Esto hace que si el aliado_id no coincide perfectamente, el producto SALGA de todos modos.
  const sql = `
    SELECT 
      p.id, 
      p.nombre, 
      p.precio_original, 
      p.precio_rescate, 
      p.stock, 
      p.imagen_url, 
      IFNULL(a.nombre_local, 'Local no asignado') as nombre_local, 
      IFNULL(a.direccion, 'Dirección no disponible') as direccion
    FROM productos_rescate p 
    LEFT JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.stock > 0 
    ORDER BY p.id DESC
  `;
  
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("ERROR SQL:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json(results || []);
  });
});

// --- RESTO DE RUTAS IGUAL QUE ANTES ---

app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  const table = role === 'vendor' ? 'aliados' : 'usuarios';
  const emailCol = role === 'vendor' ? 'correo_corporativo' : 'correo';
  const passCol = role === 'vendor' ? 'password_hash' : 'password';
  
  const sql = `SELECT id, ${role === 'vendor' ? 'nombre_local' : 'nombre'} as nombre FROM ${table} WHERE ${emailCol} = ? AND ${passCol} = ?`;
  pool.query(sql, [correo, password], (err, results) => {
    if (results?.length > 0) res.json({ mensaje: "OK", usuario: { ...results[0], role } });
    else res.status(401).json({ error: "Credenciales incorrectas" });
  });
});

app.post('/api/pedidos/crear', (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock" });
    
    const sql = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')";
    pool.query(sql, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err) => {
      if (err) return res.status(500).json({ error: "Error al crear pedido" });
      res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
    });
  });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = `SELECT p.*, a.nombre_local as local, a.direccion FROM pedidos p LEFT JOIN aliados a ON p.aliado_id = a.id WHERE p.usuario_id = ? ORDER BY p.id DESC`;
  pool.query(sql, [req.params.id], (err, results) => {
    res.json(results.map(r => ({ ...r, producto: r.nombre_producto, precio: r.precio_final })) || []);
  });
});

app.patch('/api/pedidos/:id/estado', (req, res) => {
  pool.query("UPDATE pedidos SET estado = ? WHERE id = ?", [req.body.estado, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Listo en puerto ${PORT}`));