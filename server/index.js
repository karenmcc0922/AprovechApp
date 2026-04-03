const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
app.use(cors({
  origin: ['https://aprovechapp.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST'],
  credentials: true
})); 

app.use(express.json()); 

// --- CONFIGURACIÓN DE TiDB CLOUD (Pool) ---
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

// --- CONFIGURACIÓN DE NODEMAILER (GMAIL) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  },
  pool: true, // Mantiene la conexión abierta para evitar timeouts
  maxConnections: 3,
  maxMessages: 100,
  connectionTimeout: 20000 // Le damos 20 segundos para conectar antes de rendirse
});

// Verificación con log de error detallado
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ ERROR GMAIL DETALLADO:", error);
  } else {
    console.log("📧 ✅ GMAIL CONECTADO Y LISTO.");
  }
});

// --- RUTA 1: REGISTRO INICIAL ---
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;
  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  pool.query(sql, [nombre, correo], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar" });

    const urlFrontend = "https://aprovechapp.vercel.app";
    const enlaceCompletar = `${urlFrontend}/completar-perfil?email=${correo}`;

    const mailOptions = {
      from: `"AprovechApp 🥑" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: `¡Bienvenido a AprovechApp, ${nombre}! 🎁`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; text-align: center;">
          <h2 style="color: #15803d;">¡Hola, ${nombre}! 🥑</h2>
          <p>Completa tu registro aquí:</p>
          <a href="${enlaceCompletar}" style="display: inline-block; padding: 12px 25px; background-color: #15803d; color: white; text-decoration: none; border-radius: 10px;">Completar Registro</a>
        </div>`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) console.error("❌ Error mail:", error.message);
      res.status(201).json({ mensaje: "Usuario registrado" });
    });
  });
});

// --- RUTA 2: ACTUALIZAR PERFIL (CON TELÉFONO) ---
app.post('/api/completar-perfil', (req, res) => {
  // 1. Recibimos el teléfono también desde el frontend
  const { email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;

  // 2. Agregamos 'telefono = ?' a la consulta SQL
  const sql = `
    UPDATE usuarios 
    SET password = ?, 
        telefono = ?, 
        direccion = ?, 
        municipio = ?, 
        departamento = ?, 
        pais = ?, 
        fecha_nacimiento = ? 
    WHERE correo = ?
  `;

  // 3. Agregamos el valor del teléfono al arreglo de valores
  const values = [password, telefono, direccion, municipio, departamento, pais, fechaNacimiento, email];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar perfil:", err);
      return res.status(500).json({ error: "Error al guardar los datos." });
    }
    console.log(`✅ Perfil completo actualizado para: ${email}`);
    res.status(200).json({ mensaje: "Perfil completado." });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});