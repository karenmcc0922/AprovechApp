const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuración de CORS - ACTUALIZADA para permitir DELETE y PUT
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

// --- REGISTRO DE USUARIOS (NUEVO) ---
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  // Validación mínima
  if (!nombre || !correo) {
    return res.status(400).json({ error: "Nombre y correo son requeridos" });
  }

  // Insertamos solo lo que tenemos. 
  // Nota: Asegúrate que en TiDB los otros campos (password, telefono) sean NULLABLE
  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  pool.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Este correo ya está registrado para recibir beneficios." });
      }
      console.error("Error DB:", err);
      return res.status(500).json({ error: "Error al guardar el registro previo." });
    }
    
    res.status(201).json({ 
      mensaje: "Pre-registro exitoso", 
      id: result.insertId 
    });
  });
});

// --- COMPLETAR REGISTRO (Actualización de perfil) ---
app.patch('/api/completar-registro', (req, res) => {
  const { correo, password, telefono, ciudad } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: "El correo y la contraseña son obligatorios" });
  }

  // Buscamos al usuario por correo y actualizamos sus datos
  const sql = "UPDATE usuarios SET password = ?, telefono = ?, ciudad = ? WHERE correo = ?";
  
  pool.query(sql, [password, telefono, ciudad, correo], (err, result) => {
    if (err) {
      console.error("Error al actualizar:", err);
      return res.status(500).json({ error: "Error interno al completar el perfil" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "¡Perfil completado con éxito! Ya puedes iniciar sesión." });
  });
});

// --- LOGIN MULTI-ROL ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body;
  if (role === 'vendor') {
    const sql = "SELECT id, nombre_local AS nombre, correo_corporativo FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      if (results.length > 0) {
        res.status(200).json({ mensaje: "OK", usuario: { id: results[0].id, nombre: results[0].nombre, role: 'vendor' } });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  } else {
    const sql = "SELECT id, nombre, correo FROM usuarios WHERE correo = ? AND password = ?";
    pool.query(sql, [correo, password], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      if (results.length > 0) {
        res.status(200).json({ mensaje: "OK", usuario: { id: results[0].id, nombre: results[0].nombre, role: 'user' } });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    });
  }
});

// --- GESTIÓN DE PRODUCTOS (CRUD COMPLETO) ---

// Crear
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url } = req.body;
  const sql = "INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url) VALUES (?, ?, ?, ?, ?, ?)";
  pool.query(sql, [aliado_id, nombre, Number(precio_original), Number(precio_rescate), Number(stock), imagen_url], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar" });
    res.status(201).json({ mensaje: "Éxito", id: result.insertId });
  });
});

// Editar Stock y Precio (NUEVO)
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio_rescate, stock } = req.body;
  const sql = "UPDATE productos_rescate SET nombre = ?, precio_rescate = ?, stock = ? WHERE id = ?";
  pool.query(sql, [nombre, precio_rescate, stock, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json({ mensaje: "Producto actualizado" });
  });
});

// Eliminar (NUEVO)
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM productos_rescate WHERE id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "No se pudo eliminar" });
    res.json({ mensaje: "Producto eliminado" });
  });
});

// Listar productos de un aliado
app.get('/api/mis-productos/:aliado_id', (req, res) => {
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  pool.query(sql, [req.params.aliado_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(results);
  });
});

// Catálogo general
app.get('/api/productos-todos', (req, res) => {
  const sql = "SELECT p.*, a.nombre_local, a.direccion FROM productos_rescate p JOIN aliados a ON p.aliado_id = a.id WHERE p.stock > 0 ORDER BY p.id DESC";
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(results);
  });
});

// --- PEDIDOS ---
app.post('/api/pedidos/crear', (req, res) => {
    const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final } = req.body;
    const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sqlStock = "UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0";
    
    pool.query(sqlStock, [producto_id], (err, result) => {
        if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock" });
        const sqlPedido = "INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr) VALUES (?, ?, ?, ?, ?, ?, ?)";
        pool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr], (err, row) => {
            if (err) return res.status(500).json({ error: "Error al crear pedido" });
            res.status(201).json({ mensaje: "Pedido creado", codigo: codigo_qr });
        });
    });
});

app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = "SELECT p.*, a.nombre_local FROM pedidos p JOIN aliados a ON p.aliado_id = a.id WHERE p.usuario_id = ? ORDER BY p.id DESC";
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(results);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Puerto ${PORT}`));