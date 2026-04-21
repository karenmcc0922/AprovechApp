const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
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

// --- REGISTRO DE USUARIOS ---
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) return res.status(400).json({ error: "Nombre y correo son requeridos" });

  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  pool.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Este correo ya está registrado." });
      return res.status(500).json({ error: "Error al guardar el registro." });
    }
    res.status(201).json({ mensaje: "Pre-registro exitoso", id: result.insertId });
  });
});

// --- COMPLETAR PERFIL ---
app.post('/api/completar-perfil', (req, res) => {
  const { email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;
  const sql = `UPDATE usuarios SET password = ?, telefono = ?, direccion = ?, municipio = ?, departamento = ?, pais = ?, fecha_nacimiento = ? WHERE correo = ?`;
  pool.query(sql, [password, telefono, direccion, municipio, departamento, pais, fechaNacimiento, email], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al actualizar perfil" });
    res.status(200).json({ mensaje: "Perfil completado" });
  });
});

// --- REGISTRO DE ALIADOS ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  pool.query(sql, [nombre_local, nit, correo, direccion, password], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al registrar aliado" });
    res.status(201).json({ mensaje: "Comercio registrado", aliado: { id: result.insertId, nombre_local } });
  });
});

// --- LOGIN MULTI-ROL ---
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

app.put('/api/productos/:id', (req, res) => {
  const { nombre, precio_rescate, stock } = req.body;
  const sql = "UPDATE productos_rescate SET nombre = ?, precio_rescate = ?, stock = ? WHERE id = ?";
  pool.query(sql, [nombre, precio_rescate, stock, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar" });
    res.json({ mensaje: "Producto actualizado" });
  });
});

app.delete('/api/productos/:id', (req, res) => {
  pool.query("DELETE FROM productos_rescate WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar" });
    res.json({ mensaje: "Producto eliminado" });
  });
});

app.get('/api/mis-productos/:aliado_id', (req, res) => {
  pool.query("SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC", [req.params.aliado_id], (err, results) => {
    res.json(results || []);
  });
});

app.get('/api/productos-todos', (req, res) => {
  const sql = "SELECT p.*, a.nombre_local, a.direccion FROM productos_rescate p JOIN aliados a ON p.aliado_id = a.id WHERE p.stock > 0 ORDER BY p.id DESC";
  pool.query(sql, (err, results) => res.json(results || []));
});

// --- PEDIDOS ---
app.post('/api/pedidos/crear', (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Forzamos que el stock baje y creamos el pedido con estado 'Pendiente'
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock" });
    
    const sqlPedido = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')";
    pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err) => {
      if (err) return res.status(500).json({ error: "Error al crear pedido" });
      res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
    });
  });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = `SELECT p.id, p.nombre_producto AS producto, p.precio_final AS precio, p.codigo_qr, p.estado, a.nombre_local AS local, a.direccion 
               FROM pedidos p JOIN aliados a ON p.aliado_id = a.id WHERE p.usuario_id = ? ORDER BY p.id DESC`;
  pool.query(sql, [req.params.id], (err, results) => res.json(results || []));
});

app.get('/api/pedidos/aliado/:id', (req, res) => {
  const sql = `SELECT p.*, u.telefono as usuario_telefono, u.correo as usuario_correo 
               FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC`;
  pool.query(sql, [req.params.id], (err, results) => {
    const pedidos = (results || []).map(p => ({ ...p, estado: p.estado || 'Pendiente' }));
    res.json(pedidos);
  });
});

// --- LA RUTA DEL ERROR 500 (CORREGIDA) ---
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) return res.status(400).json({ error: "Estado es requerido" });

  // Agregamos logs para depurar en Render
  console.log(`Actualizando pedido ${id} a ${estado}`);

  const sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
  pool.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error("DATABASE ERROR:", err);
      // Enviamos el sqlMessage para saber exactamente qué falló (ej. columna inexistente)
      return res.status(500).json({ error: "Error interno", detalle: err.sqlMessage });
    }
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pedido no encontrado" });
    
    res.json({ success: true, mensaje: "Estado actualizado" });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Servidor en puerto ${PORT}`));