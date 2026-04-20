const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// --- LOGIN MULTI-ROL (CORREGIDO) ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  
  if (role === 'vendor') {
    const sql = "SELECT * FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error servidor" });
      if (results.length > 0) {
        res.status(200).json({ 
          mensaje: "OK", 
          usuario: { id: results[0].id, nombre: results[0].nombre_local, role: 'vendor' } 
        });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  } else {
    const sql = "SELECT * FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error servidor" });
      if (results.length > 0) {
        res.status(200).json({ 
          mensaje: "OK", 
          usuario: { 
            id: results[0].id, // <--- ID AGREGADO PARA EL PEDIDO
            nombre: results[0].nombre, 
            correo: results[0].correo, 
            role: 'user' 
          } 
        });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  }
});

// --- CREAR PEDIDO (CORREGIDO) ---
app.post('/api/pedidos/crear', (req, res) => {
    const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
    const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Restar stock primero
    const sqlStock = "UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0";
    
    pool.query(sqlStock, [producto_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) return res.status(400).json({ error: "Sin stock disponible" });

        // 2. Insertar pedido
        const sqlPedido = `INSERT INTO pedidos 
            (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err, row) => {
            if (err) return res.status(500).json({ error: err.sqlMessage });
            res.status(201).json({ mensaje: "Pedido creado", pedidoId: row.insertId, codigo: codigo_qr });
        });
    });
});

// ... (Resto de rutas GET se mantienen igual)

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});