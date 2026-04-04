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

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor de AprovechApp corriendo en el puerto ${PORT}`);
});