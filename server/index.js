const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CONFIGURACIÓN DE MIDDLEWARES Y CORS
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})); 

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. CONEXIÓN A TiDB CLOUD (POOL DE CONEXIONES)
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

// Helper para logs de error más limpios
const handleSQLError = (res, err, message) => {
  console.error(`❌ ${message}:`, err);
  return res.status(500).json({ error: message, details: err.message });
};

// --- ENDPOINTS DE USUARIOS ---
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
    if (err) return handleSQLError(res, err, "Error al actualizar perfil");
    res.status(200).json({ mensaje: "Perfil completado" });
  });
});

// --- ENDPOINTS DE ALIADOS ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  pool.query(sql, [nombre_local, nit, correo, direccion, password], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al registrar aliado");
    res.status(201).json({ mensaje: "Comercio registrado", aliado: { id: result.insertId, nombre_local } });
  });
});

// OBTENER PERFIL COMPLETO (PRIVADO PARA PANEL DEL ALIADO)
app.get('/api/aliados/:id/panel-privado', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT nombre_local, nit, correo_corporativo, direccion FROM aliados WHERE id = ?";
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener perfil del aliado");
    if (results.length === 0) return res.status(404).json({ error: "No se encontró el establecimiento" });
    res.json(results[0]);
  });
});

// ACTUALIZAR INFORMACIÓN DEL ESTABLECIMIENTO
app.put('/api/aliados/:id/actualizar', (req, res) => {
  const { id } = req.params;
  const { nombre_local, direccion } = req.body;
  const sql = "UPDATE aliados SET nombre_local = ?, direccion = ? WHERE id = ?";
  pool.query(sql, [nombre_local, direccion, id], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al actualizar la base de datos");
    res.json({ success: true, mensaje: "Establecimiento modificado con éxito" });
  });
});

// PERFIL PÚBLICO DEL ALIADO CON SUS PRODUCTOS FILTRADOS
app.get('/api/aliados/:id/perfil', (req, res) => {
  const { id } = req.params;

  const sqlAliado = "SELECT id, nombre_local, direccion, estado_calidad FROM aliados WHERE id = ?";
  
  const sqlProductos = `
    SELECT * FROM productos_rescate 
    WHERE aliado_id = ? 
    AND stock > 0 
    AND (
      (categoria = 'Preparados' AND fecha_elaboracion >= NOW() - INTERVAL 12 HOUR) OR
      (categoria = 'Panaderia' AND fecha_elaboracion >= NOW() - INTERVAL 48 HOUR) OR
      (categoria = 'Frutas' AND fecha_elaboracion >= NOW() - INTERVAL 72 HOUR) OR
      (categoria = 'Despensa') 
      OR categoria IS NULL
    )
    ORDER BY id DESC`;

  pool.query(sqlAliado, [id], (err, aliadoResult) => {
    if (err) return handleSQLError(res, err, "Error al obtener datos del aliado");
    if (aliadoResult.length === 0) return res.status(404).json({ error: "Aliado no encontrado" });

    pool.query(sqlProductos, [id], (err, productosResult) => {
      if (err) return handleSQLError(res, err, "Error al obtener productos del aliado");

      res.json({
        aliado: aliadoResult[0],
        productos: productosResult || []
      });
    });
  });
});

// --- PRODUCTOS ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria } = req.body;
  const catFinal = categoria || 'Preparados';

  const sql = `INSERT INTO productos_rescate 
               (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
               
  pool.query(sql, [aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, catFinal], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al guardar producto en la base de datos");
    res.status(201).json({ mensaje: "Producto creado con éxito", id: result.insertId });
  });
});

app.get('/api/productos-todos', (req, res) => {
  const sql = `
    SELECT p.*, a.nombre_local, a.direccion 
    FROM productos_rescate p 
    JOIN aliados a ON p.aliado_id = a.id 
    WHERE p.stock > 0 
    AND a.estado_calidad != 'Bloqueado'
    AND (
      (p.categoria = 'Preparados' AND p.fecha_elaboracion >= NOW() - INTERVAL 12 HOUR) OR
      (p.categoria = 'Panaderia' AND p.fecha_elaboracion >= NOW() - INTERVAL 48 HOUR) OR
      (p.categoria = 'Frutas' AND p.fecha_elaboracion >= NOW() - INTERVAL 72 HOUR) OR
      (p.categoria = 'Despensa') 
      OR p.categoria IS NULL
    )
    ORDER BY p.id DESC`;

  pool.query(sql, (err, results) => {
    if (err) return handleSQLError(res, err, "Error al cargar catálogo");
    res.json(results || []);
  });
});

app.get('/api/mis-productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al cargar tus productos");
    res.json(results || []);
  });
});

// --- GESTIÓN DE PEDIDOS ---
app.post('/api/pedidos/crear', (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock disponible" });
    
    const sqlPedido = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')";
    pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err) => {
      if (err) return handleSQLError(res, err, "Error al crear pedido");
      res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
    });
  });
});

app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
  pool.query(sql, [estado, id], (err) => {
    if (err) return handleSQLError(res, err, "Error al actualizar estado");
    res.json({ success: true });
  });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = "SELECT p.*, a.nombre_local, a.direccion FROM pedidos p JOIN aliados a ON p.aliado_id = a.id WHERE p.usuario_id = ? ORDER BY p.id DESC";
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener pedidos");
    res.json(results);
  });
});

app.get('/api/pedidos/aliado/:id', (req, res) => {
  const sql = "SELECT p.*, u.nombre AS nombre_usuario FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC";
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener pedidos del aliado");
    res.json(results);
  });
});

app.get('/api/pedidos/validar/:codigo/:aliadoId', (req, res) => {
  const { codigo, aliadoId } = req.params;
  const sql = `
    SELECT p.*, u.nombre as nombre_usuario 
    FROM pedidos p 
    JOIN usuarios u ON p.usuario_id = u.id 
    WHERE p.codigo_qr = ? AND p.aliado_id = ?
  `;
  pool.query(sql, [codigo, aliadoId], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al validar código");
    if (results.length === 0) return res.status(404).json({ mensaje: "Código no encontrado o no pertenece a este local" });
    res.json(results[0]);
  });
});

// --- SEGURIDAD ALIMENTARIA ---
app.post('/api/reportar-calidad', (req, res) => {
  const { pedido_id, usuario_id, aliado_id, motivo, foto_evidencia } = req.body;
  const sql = "INSERT INTO reportes_calidad (pedido_id, usuario_id, aliado_id, motivo, foto_evidencia) VALUES (?, ?, ?, ?, ?)";
  
  pool.query(sql, [pedido_id, usuario_id, aliado_id, motivo, foto_evidencia], (err) => {
    if (err) return handleSQLError(res, err, "Error al enviar reporte");
    
    const checkSql = "SELECT COUNT(*) as fallas FROM reportes_calidad WHERE aliado_id = ?";
    pool.query(checkSql, [aliado_id], (err, results) => {
      if (!err && results[0].fallas >= 3) {
        pool.query("UPDATE aliados SET estado_calidad = 'Advertencia' WHERE id = ?", [aliado_id]);
      }
    });
    res.status(201).json({ mensaje: "Reporte recibido" });
  });
});

// --- ANALÍTICAS ---
app.get('/api/aliados/:id/estadisticas', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT COUNT(*) as total_rescates, SUM(precio_final) as total_ganado FROM pedidos WHERE aliado_id = ? AND (estado = 'Completado' OR estado = 'Entregado')";
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error en estadísticas");
    res.json(results[0] || { total_rescates: 0, total_ganado: 0 });
  });
});

app.get('/api/aliados/:id/ventas-semanales', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT DATE_FORMAT(fecha, '%d/%m') as fecha, SUM(precio_final) as total 
    FROM pedidos 
    WHERE aliado_id = ? AND (estado = 'Completado' OR estado = 'Entregado')
    GROUP BY DATE_FORMAT(fecha, '%d/%m')
    ORDER BY MIN(fecha) ASC LIMIT 7`;
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error en gráfica");
    res.json(results || []);
  });
});

app.get('/api/aliados/:id/actividad', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM historial_actividad WHERE aliado_id = ? ORDER BY fecha DESC LIMIT 10";
  pool.query(sql, [id], (err, results) => {
    if (err) return res.json([]); 
    res.json(results || []);
  });
});

// --- LOGIN ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  if (role === 'vendor') {
    const sql = "SELECT id, nombre_local AS nombre, correo_corporativo FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return handleSQLError(res, err, "Error en Login Aliado");
      if (results?.length > 0) res.json({ mensaje: "OK", usuario: { ...results[0], role: 'vendor' } });
      else res.status(401).json({ error: "Credenciales incorrectas" });
    });
  } else {
    const sql = "SELECT id, nombre, correo FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return handleSQLError(res, err, "Error en Login Usuario");
      if (results?.length > 0) res.json({ mensaje: "OK", usuario: { ...results[0], role: 'user' } });
      else res.status(401).json({ error: "Credenciales incorrectas" });
    });
  }
});

// LANZAMIENTO
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor AprovechApp corriendo en el puerto ${PORT}`);
});