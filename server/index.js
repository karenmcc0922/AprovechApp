const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { Resend } = require('resend'); // 1. Importamos Resend
require('dotenv').config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY); // 2. Inicializamos

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
  database: process.env.DB_NAME, // Asegúrate que sea 'aprovechapp-db'
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10
});

// --- RUTA 1: REGISTRO E INICIO DE FLUJO ---
app.post('/api/registro', async (req, res) => {
  const { nombre, correo } = req.body;
  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  pool.query(sql, [nombre, correo], async (err, result) => {
    if (err) {
      console.error("Error DB:", err);
      return res.status(500).json({ error: "Error al guardar" });
    }

    const urlFrontend = "https://aprovechapp.vercel.app";
    const enlaceCompletar = `${urlFrontend}/completar-perfil?email=${correo}`;

    try {
      // 3. ENVIAR CORREO CON RESEND (No falla en Render)
      await resend.emails.send({
        from: 'AprovechApp <onboarding@resend.dev>', // Email de prueba de Resend
        to: correo,
        subject: `¡Bienvenido a AprovechApp, ${nombre}! 🎁`,
        html: `
          <div style="font-family: sans-serif; text-align: center;">
            <h2 style="color: #15803d;">¡Hola, ${nombre}! 🥑</h2>
            <p>Gracias por unirte. Haz clic abajo para completar tu perfil:</p>
            <a href="${enlaceCompletar}" style="display: inline-block; padding: 12px 25px; background-color: #15803d; color: white; text-decoration: none; border-radius: 10px; font-weight: bold;">
               Completar mi Registro
            </a>
            <p style="font-size: 11px; color: #999; margin-top: 20px;">AprovechApp 2026</p>
          </div>
        `
      });

      console.log("📧 Correo enviado vía Resend a:", correo);
      res.status(201).json({ mensaje: "Usuario registrado y correo enviado" });

    } catch (mailError) {
      console.error("❌ Error enviando mail:", mailError);
      res.status(201).json({ mensaje: "Usuario guardado, pero falló el envío del correo." });
    }
  });
});

// --- RUTA 2: ACTUALIZAR PERFIL ---
app.post('/api/completar-perfil', (req, res) => {
  const { email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;
  const sql = `UPDATE usuarios SET password=?, telefono=?, direccion=?, municipio=?, departamento=?, pais=?, fecha_nacimiento=? WHERE correo=?`;
  const values = [password, telefono, direccion, municipio, departamento, pais, fechaNacimiento, email];

  pool.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Error al guardar datos" });
    res.status(200).json({ mensaje: "Perfil completado" });
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor con Resend corriendo en puerto ${PORT}`);
});