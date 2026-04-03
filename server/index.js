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

// --- CONEXIÓN A TiDB CLOUD ---
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // ESTA ES LA PARTE QUE FALTA:
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    // Si sale error aquí, revisa las variables en Render
    console.error('❌ Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('✅ Conectado a TiDB Cloud con éxito.');
});

// --- CONFIGURACIÓN DE NODEMAILER (GMAIL) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// --- RUTA 1: REGISTRO INICIAL Y ENVÍO DE CORREO ---
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  db.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar:", err);
      return res.status(500).json({ error: "Error al guardar el usuario" });
    }

    const urlFrontend = "https://aprovechapp.vercel.app";
    const enlaceCompletar = `${urlFrontend}/completar-perfil?email=${correo}`;

    const mailOptions = {
      from: `"AprovechApp 🥑" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: `¡Bienvenido a AprovechApp, ${nombre}! 🎁`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px; text-align: center;">
          <h2 style="color: #15803d;">¡Hola, ${nombre}! 🥑</h2>
          <p>Gracias por unirte a la comunidad que rescata comida deliciosa.</p>
          
          <div style="background-color: #fff7ed; padding: 15px; border-radius: 10px; border-left: 5px solid #ffa832; margin: 20px 0;">
            <p style="margin: 0; color: #9a3412;"><strong>🎁 Tu Regalo:</strong> 15% DTO con el código <strong>SOYAPROVECHADOR</strong></p>
          </div>

          <p>Para crear tu contraseña y completar tu perfil, haz clic abajo:</p>
          
          <a href="${enlaceCompletar}" 
             style="display: inline-block; padding: 14px 30px; background-color: #15803d; color: white; text-decoration: none; font-weight: bold; border-radius: 10px; margin: 10px 0;">
             Completar mi Registro
          </a>

          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Si el botón no funciona, copia este enlace: <br>
            <span style="color: #15803d;">${enlaceCompletar}</span>
          </p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="font-size: 11px; color: #999;">AprovechApp 2026 - Pereira, Risaralda 🇨🇴</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Error enviando mail:", error);
      } else {
        console.log("📧 Correo enviado con éxito a: " + correo);
      }
    });

    res.status(201).json({ 
      mensaje: "¡Usuario registrado y correo enviado!", 
      id: result.insertId 
    });
  });
});

// --- RUTA 2: ACTUALIZAR PERFIL CON DATOS ADICIONALES ---
app.post('/api/completar-perfil', (req, res) => {
  const { 
    email, 
    password, 
    direccion, 
    municipio, 
    departamento, 
    pais, 
    fechaNacimiento 
  } = req.body;

  const sql = `
    UPDATE usuarios 
    SET password = ?, 
        direccion = ?, 
        municipio = ?, 
        departamento = ?, 
        pais = ?, 
        fecha_nacimiento = ? 
    WHERE correo = ?
  `;

  const values = [password, direccion, municipio, departamento, pais, fechaNacimiento, email];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error al actualizar perfil:", err);
      return res.status(500).json({ error: "Error al guardar los datos" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    console.log(`✅ Datos guardados para: ${email}`);
    res.status(200).json({ mensaje: "Perfil completado con éxito" });
  });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});