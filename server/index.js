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
  pool.query(sql, [nombre, correo], (err) => {
    if (err) return res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? "Correo ya existe" : "Error DB" });
    res.status(201).json({ mensaje: "Pre-registro exitoso" });
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

// RUTA PARA CONFIRMAR ENTREGA (PATCH)
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  console.log(`Intentando actualizar pedido ID: ${id} a estado: ${estado}`);

  // 1. Validamos que el ID sea un número
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID de pedido no válido" });
  }

  // 2. Ejecutamos el UPDATE
  // Importante: Asegúrate de que la columna se llame 'estado' en tu tabla 'pedidos'
  const sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
  
  pool.query(sql, [estado, id], (err, result) => {
    if (err) {
      // ESTE LOG ES EL QUE DEBES MIRAR EN RENDER SI SALE ERROR 500
      console.error("❌ ERROR CRÍTICO EN DB:", err.sqlMessage);
      return res.status(500).json({ error: "Error interno del servidor", detalle: err.sqlMessage });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No se encontró el pedido para actualizar" });
    }

    console.log("✅ Estado actualizado correctamente en la base de datos");
    res.json({ success: true });
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

// --- PRODUCTOS (CATÁLOGO) ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url } = req.body;
  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(sql, [aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar producto" });
    res.status(201).json({ mensaje: "Éxito", id: result.insertId });
  });
});

app.get('/api/productos-todos', (req, res) => {
  // JOIN crucial para que aparezca el nombre del local en las cards
  const sql = `
    SELECT p.*, a.nombre_local, a.direccion 
    FROM productos_rescate p 
    JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.stock > 0 
    ORDER BY p.id DESC`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error en productos-todos:", err);
      return res.status(500).json({ error: "Error al cargar catálogo" });
    }
    res.json(results || []);
  });
});

// NUEVA RUTA: Obtener productos de UN aliado específico
app.get('/api/mis-productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener mis productos:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    // Devolvemos los productos (o una lista vacía si no tiene ninguno)
    res.json(results || []);
  });
});

// --- PEDIDOS Y RESCATES ---
app.post('/api/pedidos/crear', (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock disponible" });
    
    const sqlPedido = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')";
    pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err) => {
      if (err) return res.status(500).json({ error: "Error al crear el pedido" });
      res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
    });
  });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = `
    SELECT p.id, p.nombre_producto, p.precio_final, p.codigo_qr, p.estado, a.nombre_local, a.direccion 
    FROM pedidos p 
    JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.usuario_id = ? 
    ORDER BY p.id DESC`;
  
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al cargar rescates" });
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

app.get('/api/pedidos/aliado/:id', (req, res) => {
  const sql = `
    SELECT p.*, u.telefono as usuario_telefono, u.correo as usuario_correo 
    FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC`;
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json((results || []).map(p => ({ ...p, estado: p.estado || 'Pendiente' })));
  });
});

app.get('/api/aliados/:id/estadisticas', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      COUNT(*) as total_rescates, 
      SUM(precio_final) as total_ganado
    FROM pedidos 
    WHERE aliado_id = ? AND estado = 'Completado'
  `;
  
  pool.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0]);
  });
});

app.get('/api/aliados/:id/actividad', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT * FROM historial_actividad 
    WHERE aliado_id = ? 
    ORDER BY fecha DESC 
    LIMIT 10
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
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

// 3. Puerto de escucha
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor AprovechApp ejecutándose en puerto ${PORT}`);
});