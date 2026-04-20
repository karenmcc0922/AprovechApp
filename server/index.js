const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Pool de Conexión a MySQL
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
    const sql = "SELECT id, nombre_local, correo_corporativo FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      if (results.length > 0) {
        res.status(200).json({ 
          mensaje: "OK", 
          usuario: { 
            id: results[0].id, 
            nombre: results[0].nombre_local, 
            role: 'vendor' 
          } 
        });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas para Aliado" });
      }
    });
  } else {
    const sql = "SELECT id, nombre, correo FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      if (results.length > 0) {
        res.status(200).json({ 
          mensaje: "OK", 
          usuario: { 
            id: results[0].id, 
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

// --- REGISTRO DE ALIADOS ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  
  pool.query(sql, [nombre_local, nit, correo, direccion, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "NIT o correo ya registrados." });
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.status(201).json({ mensaje: "Éxito", aliado: { id: result.insertId, nombre_local } });
  });
});

// --- GESTIÓN DE PRODUCTOS ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url } = req.body;
  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
  
  pool.query(sql, [aliado_id, nombre, Number(precio_original), Number(precio_rescate), Number(stock), imagen_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar el producto" });
    res.status(201).json({ mensaje: "Éxito", id: result.insertId });
  });
});

app.get('/api/mis-productos/:aliado_id', (req, res) => {
  const { aliado_id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  pool.query(sql, [aliado_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener productos" });
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
    if (err) return res.status(500).json({ error: "Error al obtener catálogo" });
    res.status(200).json(results);
  });
});

// --- CREAR PEDIDO Y RESTAR STOCK (TRANSACCIONAL) ---
app.post('/api/pedidos/crear', (req, res) => {
    const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
    const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Restar stock
    const sqlStock = "UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0";
    
    pool.query(sqlStock, [producto_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al actualizar stock" });
        if (result.affectedRows === 0) return res.status(400).json({ error: "Producto agotado" });

        // 2. Insertar pedido
        const sqlPedido = `INSERT INTO pedidos 
            (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err, row) => {
            if (err) return res.status(500).json({ error: "Error al registrar el pedido" });
            res.status(201).json({ 
              mensaje: "Pedido creado correctamente", 
              pedidoId: row.insertId, 
              codigo: codigo_qr 
            });
        });
    });
});

// --- OBTENER PEDIDOS (ALIADO Y USUARIO) ---
app.get('/api/pedidos/aliado/:id', (req, res) => {
    const sql = "SELECT * FROM pedidos WHERE aliado_id = ? ORDER BY id DESC";
    pool.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json(results);
    });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
    const sql = "SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC";
    pool.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json(results);
    });
});

// --- RESTAR STOCK INDEPENDIENTE (PATCH) ---
app.patch('/api/productos/restar-stock/:id', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0";
  
  pool.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    if (result.affectedRows === 0) return res.status(400).json({ error: "Sin stock o no encontrado" });
    res.status(200).json({ mensaje: "Stock actualizado" });
  });
});

// Iniciar Servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor AprovechApp corriendo en puerto ${PORT}`);
});