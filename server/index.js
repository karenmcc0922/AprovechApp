const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST'],
  credentials: true
})); 

app.use(express.json()); 

// --- CONFIGURACIÓN DE TiDB CLOUD (Pool de conexiones) ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Prueba de conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a TiDB Cloud:', err.message);
    return;
  }
  console.log('✅ Conectado a TiDB Cloud con éxito.');
  connection.release();
});

// --- RUTA 1: REGISTRO INICIAL ---
// Esta ruta solo guarda en la DB. El correo lo envía React usando EmailJS.
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  pool.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar en la DB:", err);
      return res.status(500).json({ error: "Error al guardar el usuario." });
    }
    
    console.log(`👤 Usuario registrado en DB: ${correo}`);
    // Respondemos éxito para que React proceda a enviar el EmailJS
    return res.status(201).json({ 
      mensaje: "Usuario guardado en base de datos correctamente.",
      id: result.insertId 
    });
  });
});

// --- RUTA 2: ACTUALIZAR PERFIL ---
app.post('/api/completar-perfil', (req, res) => {
  const { email, password, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;

  const sql = `
    UPDATE usuarios 
    SET password = ?, direccion = ?, municipio = ?, departamento = ?, pais = ?, fecha_nacimiento = ? 
    WHERE correo = ?
  `;

  const values = [password, direccion, municipio, departamento, pais, fechaNacimiento, email];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar perfil:", err);
      return res.status(500).json({ error: "Error al guardar los datos del perfil." });
    }
    console.log(`✅ Perfil completado para: ${email}`);
    res.status(200).json({ mensaje: "Perfil actualizado con éxito." });
  });
});

// --- RUTA 3: REGISTRO DE ALIADOS (COMERCIOS) ---
app.post('/api/registro-aliado', (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;

  const sql = `
    INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  const values = [nombre_local, nit, correo, direccion, password];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al registrar aliado:", err);
      // Manejo de error si el NIT o Correo ya existen
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "El NIT o el correo ya están registrados." });
      }
      return res.status(500).json({ error: "Error al guardar el comercio." });
    }
    
    console.log(`🏪 Nuevo aliado registrado: ${nombre_local}`);
    return res.status(201).json({ 
      mensaje: "Comercio registrado con éxito.",
      aliado: { id: result.insertId, nombre_local } 
    });
  });
});

// --- RUTA 4: PUBLICAR PRODUCTO (DASHBOARD ALIADO) ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock } = req.body;

  const sql = `
    INSERT INTO productos_rescate (aliado_id, nombre, precio_original, precio_rescate, stock) 
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [aliado_id, nombre, precio_original, precio_rescate, stock];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al publicar producto:", err);
      return res.status(500).json({ error: "Error al publicar el producto." });
    }
    res.status(201).json({ mensaje: "Producto publicado con éxito.", id: result.insertId });
  });
});

// --- RUTA 5: OBTENER PRODUCTOS DEL ALIADO ---
app.get('/api/mis-productos/:aliado_id', (req, res) => {
  const { aliado_id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY fecha_publicacion DESC";

  pool.query(sql, [aliado_id], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener productos:", err);
      return res.status(500).json({ error: "Error al obtener la lista." });
    }
    res.status(200).json(results);
  });
});

// --- ACTUALIZACIÓN DE LA RUTA DE LOGIN (Para soportar ambos roles) ---
app.post('/api/login', (req, res) => {
  const { correo, password, role } = req.body; // Recibimos el rol desde el frontend

  // Si el rol es vendor (comercio), buscamos en la tabla aliados
  if (role === 'vendor') {
    const sql = "SELECT * FROM aliados WHERE correo_corporativo = ? AND password = ?";
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
    // Si no es vendor, usamos tu lógica original de usuarios
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

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor de AprovechApp corriendo en el puerto ${PORT}`);
});

// --- RUTA DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE correo = ? AND password = ?";
  
  pool.query(sql, [correo, password], (err, results) => {
    if (err) {
      console.error("❌ Error en el login:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length > 0) {
      // Usuario encontrado y contraseña coincide
      const usuario = results[0];
      console.log(`🔑 Sesión iniciada: ${correo}`);
      res.status(200).json({ 
        mensaje: "Login exitoso", 
        usuario: { nombre: usuario.nombre, correo: usuario.correo } 
      });
    } else {
      // No coincide el correo o la contraseña
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  });
});