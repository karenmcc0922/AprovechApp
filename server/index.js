const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); // <-- 1. Importamos Nodemailer
require('dotenv').config();

const app = express();

// Configuraciones
app.use(cors()); 
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

// --- 2. CONFIGURACIÓN DEL "CARTERO" (GMAIL) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo en el .env
    pass: process.env.EMAIL_PASS  // Tus 16 letras de aplicación en el .env
  }
});

// RUTA: Recibir datos y enviar correo
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;

  // Primero guardamos en la base de datos
  const sql = "INSERT INTO usuarios (nombre, correo) VALUES (?, ?)";
  
  db.query(sql, [nombre, correo], (err, result) => {
    if (err) {
      console.error("Error al insertar:", err);
      return res.status(500).json({ error: "Error al guardar el usuario" });
    }

    // --- 3. PREPARAR Y ENVIAR EL CORREO ---
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
          <p>Para ver las ofertas de hoy y completar tu perfil, haz clic abajo:</p>
          <a href="http://localhost:5173/completar-perfil?email=${correo}" 
             style="display: inline-block; padding: 12px 25px; background-color: #15803d; color: white; text-decoration: none; font-weight: bold; border-radius: 10px;">
             Completar mi Registro
          </a>
          <p style="font-size: 11px; color: #999; margin-top: 25px;">AprovechApp 2026 - Pereira, Risaralda</p>
        </div>
      `
    };

    // Enviamos el correo de forma asíncrona
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("❌ Error enviando mail:", error);
        // Aunque el mail falle, el usuario ya se registró en la DB
      } else {
        console.log("📧 Correo enviado con éxito a: " + correo);
      }
    });

    // Respuesta final al Frontend de React
    res.status(201).json({ 
      mensaje: "¡Usuario registrado y correo enviado!", 
      id: result.insertId 
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});