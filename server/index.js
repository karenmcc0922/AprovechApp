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

// Conexión a MariaDB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MariaDB:', err.message);
    return;
  }
  console.log('✅ Conectado a MariaDB con éxito.');
});

// --- CONFIGURACIÓN DEL "CARTERO" (GMAIL) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// RUTA: Recibir datos y enviar correo
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  db.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      console.error("Error al insertar:", err);
      return res.status(500).json({ error: "Error al guardar el usuario" });
    }

    // --- CAMBIO CLAVE: URL DE VERCEL ---
    const urlFrontend = "https://aprovechapp.vercel.app";
    const enlaceCompletar = `${urlFrontend}/completar-perfil?email=${correo}`;

    // --- PREPARAR Y ENVIAR EL CORREO ---
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

          <p>Para crear tu contraseña y empezar a salvar comida, haz clic abajo:</p>
          
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});