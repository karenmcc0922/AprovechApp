const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Configuración de CORS
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. Conexión a TiDB
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

// --- USUARIOS ---
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;
  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  pool.query(sql, [nombre, correo], (err, result) => {
    if (err) return res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? "Correo ya existe" : "Error DB" });
    res.status(201).json({ mensaje: "Pre-registro exitoso", id: result.insertId });
  });
});

app.post('/api/completar-perfil', (req, res) => {
  const { email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;
  const sql = `UPDATE usuarios SET password = ?, telefono = ?, direccion = ?, municipio = ?, departamento = ?, pais = ?, fecha_nacimiento = ? WHERE correo = ?`;
  pool.query(sql, [password, telefono, direccion, municipio, departamento, pais, fechaNacimiento, email], (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar perfil" });
    res.status(200).json({ mensaje: "Perfil completado" });
  });
});

// --- ALIADOS ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  pool.query(sql, [nombre_local, nit, correo, direccion, password], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al registrar aliado" });
    res.status(201).json({ mensaje: "Comercio registrado", aliado: { id: result.insertId, nombre_local } });
  });
});

// --- LOGIN ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  if (role === 'vendor') {
    const sql = "SELECT id, nombre_local AS nombre, correo_corporativo FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (results?.length > 0) res.json({ mensaje: "OK", usuario: { id: results[0].id, nombre: results[0].nombre, role: 'vendor' } });
      else res.status(401).json({ error: "Credenciales incorrectas" });
    });
  } else {
    const sql = "SELECT id, nombre, correo FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (results?.length > 0) res.json({ mensaje: "OK", usuario: { id: results[0].id, nombre: results[0].nombre, role: 'user' } });
      else res.status(401).json({ error: "Credenciales incorrectas" });
    });
  }
});

// --- PRODUCTOS ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url } = req.body;
  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(sql, [aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar" });
    res.status(201).json({ mensaje: "Éxito", id: result.insertId });
  });
});

app.get('/api/productos-todos', (req, res) => {
  const sql = "SELECT p.*, a.nombre_local, a.direccion FROM productos_rescate p JOIN aliados a ON p.aliado_id = a.id WHERE p.stock > 0 ORDER BY p.id DESC";
  pool.query(sql, (err, results) => res.json(results || []));
});

// --- PEDIDOS (Gestión de Rescates) ---

// 1. Crear Pedido
app.post('/api/pedidos/crear', (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock" });
    
    const sqlPedido = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')";
    pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err) => {
      if (err) return res.status(500).json({ error: "Error al crear pedido" });
      res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
    });
  });
});

// 2. Listar para el Usuario (Historial y Activos)
app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = `
    SELECT p.id, p.nombre_producto, p.precio_final, p.codigo_qr, p.estado, a.nombre_local, a.direccion 
    FROM pedidos p 
    JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.usuario_id = ? 
    ORDER BY p.id DESC`;
  
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    // Mapeo para que el frontend reciba los nombres que ya configuramos
    const data = (results || []).map(r => ({
      id: r.id,
      producto: r.nombre_producto,
      precio: r.precio_final,
      codigo_qr: r.codigo_qr,
      estado: r.estado || 'Pendiente',
      local: r.nombre_local,
      direccion: r.direccion
    }));
    res.json(data);
  });
});

// 3. Listar para el Aliado (Panel de Control)
app.get('/api/pedidos/aliado/:id', (req, res) => {
  const sql = `
    SELECT p.*, u.telefono as usuario_telefono, u.correo as usuario_correo 
    FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC`;
  pool.query(sql, [req.params.id], (err, results) => {
    res.json((results || []).map(p => ({ ...p, estado: p.estado || 'Pendiente' })));
  });
});

// 4. ACTUALIZAR ESTADO (La ruta que daba error 500)
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) return res.status(400).json({ error: "Estado requerido" });

  console.log(`PATCH: Pedido ${id} -> ${estado}`);

  const sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
  pool.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error("SQL ERROR:", err.sqlMessage);
      return res.status(500).json({ error: "Error DB", detalle: err.sqlMessage });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: "No encontrado" });
    res.json({ success: true });
  });
});

// Puerto
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Servidor listo en puerto ${PORT}`));