const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
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

// Convertimos el pool para soporte nativo de async/await
const promisePool = pool.promise();

// 3. CONFIGURACIÓN DEL TRANSPORTADOR DE NODEMAILER (Forzado a IPv4 para Render)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  },
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000
});

const handleSQLError = (res, err, message) => {
  console.error(`❌ ${message}:`, err);
  return res.status(500).json({ error: message, details: err.message });
};

// --- ENDPOINTS DE USUARIOS ---

app.post('/api/registro', async (req, res) => {
  const { nombre, correo } = req.body; // 🔄 CORREGIDO: Sintaxis limpia aquí
  try {
    const [rows] = await promisePool.query("SELECT COUNT(*) as total_usuarios FROM usuarios");
    const totalActual = rows[0].total_usuarios;
    const esPionero = totalActual < 100 ? 1 : 0;

    const sql = "INSERT INTO usuarios (nombre, correo, regalo_descuento, regalo_domicilio) VALUES (?, ?, ?, ?)";
    await promisePool.query(sql, [nombre, correo, esPionero, esPionero]);
    
    res.status(201).json({ mensaje: "Pre-registro exitoso", pionero: esPionero === 1 });
  } catch (err) {
    return res.status(500).json({ 
      error: err.code === 'ER_DUP_ENTRY' ? "Correo ya existe" : "Error DB" 
    });
  }
});

app.post('/api/completar-perfil', async (req, res) => {
  const { email, password, telefono, direccion, municipio, departamento, pais, fechaNacimiento } = req.body;
  const sql = `UPDATE usuarios SET password = ?, telefono = ?, direccion = ?, municipio = ?, departamento = ?, pais = ?, fecha_nacimiento = ? WHERE correo = ?`;
  try {
    await promisePool.query(sql, [password, telefono, direccion, municipio, departamento, pais, fechaNacimiento, email]);
    res.status(200).json({ mensaje: "Perfil completado" });
  } catch (err) {
    return handleSQLError(res, err, "Error al actualizar perfil");
  }
});

app.put('/api/usuarios/:id/actualizar', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;

  if (!nombre || !telefono || !direccion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const sql = "UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?";
  try {
    const [result] = await promisePool.query(sql, [nombre, telefono, direccion, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ success: true, mensaje: "Perfil actualizado con éxito" });
  } catch (err) {
    return handleSQLError(res, err, "Error interno al actualizar la cuenta");
  }
});

// --- ENDPOINTS DE ALIADOS ---
app.post('/api/registro-aliado', async (req, res) => {
  const { nombre_local, nit, correo, direccion, password } = req.body;
  const sql = `INSERT INTO aliados (nombre_local, nit, correo_corporativo, direccion, password_hash) VALUES (?, ?, ?, ?, ?)`;
  try {
    const [result] = await promisePool.query(sql, [nombre_local, nit, correo, direccion, password]);
    res.status(201).json({ mensaje: "Comercio registrado", aliado: { id: result.insertId, nombre_local } });
  } catch (err) {
    return handleSQLError(res, err, "Error al registrar aliado");
  }
});

app.get('/api/aliados/:id/panel-privado', async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT nombre_local, nit, correo_corporativo, direccion FROM aliados WHERE id = ?";
  try {
    const [results] = await promisePool.query(sql, [id]);
    if (results.length === 0) return res.status(404).json({ error: "No se encontró el establecimiento" });
    res.json(results[0]);
  } catch (err) {
    return handleSQLError(res, err, "Error al obtener perfil del aliado");
  }
});

app.put('/api/aliados/:id/actualizar', async (req, res) => {
  const { id } = req.params;
  const { nombre_local, direccion } = req.body;
  const sql = "UPDATE aliados SET nombre_local = ?, direccion = ? WHERE id = ?";
  try {
    await promisePool.query(sql, [nombre_local, direccion, id]);
    res.json({ success: true, mensaje: "Establecimiento modificado con éxito" });
  } catch (err) {
    return handleSQLError(res, err, "Error al actualizar la base de datos");
  }
});

app.get('/api/aliados/:id/perfil', async (req, res) => {
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

  try {
    const [aliadoResult] = await promisePool.query(sqlAliado, [id]);
    if (aliadoResult.length === 0) return res.status(404).json({ error: "Aliado no encontrado" });

    const [productosResult] = await promisePool.query(sqlProductos, [id]);
    res.json({
      aliado: aliadoResult[0],
      productos: productosResult || []
    });
  } catch (err) {
    return handleSQLError(res, err, "Error al obtener datos del aliado/productos");
  }
});

// --- PRODUCTOS: PUBLICACIÓN + NOTIFICACIÓN AL COMERCIO + ALERTAS EMAILJS A CLIENTES ---
app.post('/api/productos', async (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria } = req.body;
  const catFinal = categoria || 'Preparados';

  if (!aliado_id) {
    return res.status(400).json({ error: "El campo aliado_id es requerido." });
  }

  try {
    // 1. Guardar el producto en la Base de Datos
    const sqlInsert = `INSERT INTO productos_rescate 
      (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
               
    const [resultInsert] = await promisePool.query(sqlInsert, [aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, catFinal]);
    
    // 2. Registrar en el historial de actividad
    const mensajeActividad = `Publicó una nueva oferta: ${nombre} (${stock} und.)`;
    const sqlHistorial = "INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)";
    await promisePool.query(sqlHistorial, [aliado_id, mensajeActividad]).catch(e => console.error("⚠️ Error historial:", e.message));

    // 3. Flujo de Notificaciones protegido por Try/Catch
    try {
      const sqlBuscarAliado = "SELECT nombre_local, correo_corporativo FROM aliados WHERE id = ?";
      const [resultadosAliado] = await promisePool.query(sqlBuscarAliado, [aliado_id]);

      if (resultadosAliado && resultadosAliado.length > 0) {
        const { nombre_local, correo_corporativo } = resultadosAliado[0];

        // ==========================================
        // FLUJO A: CORREO DE CONFIRMACIÓN AL COMERCIO (Nodemailer)
        // ==========================================
        const mailOptionsAliado = {
          from: `"AprovechApp" <${process.env.EMAIL_USER}>`,
          to: correo_corporativo,
          subject: `¡Tu oferta "${nombre}" ya está publicada en AprovechApp! 🚀`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; padding: 20px; border-radius: 20px;">
              <h2 style="color: #16a34a; text-transform: uppercase;">¡Hola, ${nombre_local}!</h2>
              <p style="color: #334155; font-size: 14px;">Queremos confirmarte que tu oferta ha sido publicada exitosamente de manera segura en nuestra plataforma.</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Detalles de la publicación:</h4>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Producto/Pack:</strong> ${nombre}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Categoría:</strong> ${catFinal}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Unidades Disponibles:</strong> ${stock}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #16a34a;"><strong>Precio de Rescate:</strong> $${Number(precio_rescate).toLocaleString()}</p>
              </div>
            </div>`
        };

        await new Promise((resolve) => {
          transporter.sendMail(mailOptionsAliado, (errorMail) => {
            if (errorMail) console.error("❌ Error Nodemailer (Comercio):", errorMail.message);
            else console.log(`📧 Correo enviado con éxito al aliado: ${correo_corporativo}`);
            resolve(true);
          });
        });

        // ==========================================
        // FLUJO B: NOTIFICACIÓN A CLIENTES CON EMAILJS
        // ==========================================
        const sqlClientesHistoricos = `
          SELECT DISTINCT u.correo, u.nombre 
          FROM pedidos p
          JOIN usuarios u ON p.usuario_id = u.id
          WHERE p.aliado_id = ?
        `;
        const [clientes] = await promisePool.query(sqlClientesHistoricos, [aliado_id]);

        if (clientes && clientes.length > 0) {
          console.log(`📢 Enviando alertas EmailJS a ${clientes.length} clientes recurrentes.`);

          const promesasEmailJS = clientes.map((cliente) => {
            const templateParams = {
              cliente_nombre: cliente.nombre,
              cliente_email: cliente.correo,
              nombre_local: nombre_local,
              nombre_producto: nombre,
              precio_rescate: Number(precio_rescate).toLocaleString(),
              stock_disponible: stock,
              categoria_producto: catFinal
            };

            return fetch('https://api.emailjs.com/api/v1.0/email/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID,
                template_id: 'template_m2ehwtb',
                user_id: process.env.EMAILJS_PUBLIC_KEY, 
                private_key: process.env.EMAILJS_PRIVATE_KEY, // 🔒 Seguridad para el modo estricto añadida
                template_params: templateParams
              })
            })
            .then(async (response) => {
              if (response.ok) {
                console.log(`📧 [EmailJS] Notificación enviada con éxito a: ${cliente.correo}`);
              } else {
                const errorText = await response.text();
                console.error(`❌ [EmailJS] Falló el envío a ${cliente.correo}:`, errorText);
              }
            })
            .catch((errFetch) => {
              console.error(`❌ [EmailJS] Error en petición para ${cliente.correo}:`, errFetch.message);
            });
          });

          await Promise.all(promesasEmailJS);
        }
      }
    } catch (emailError) {
      console.error("⚠️ Los correos no pudieron procesarse, pero el producto fue guardado:", emailError.message);
    }

    return res.status(201).json({ mensaje: "Producto creado correctamente en catálogo", id: resultInsert.insertId });

  } catch (err) {
    return handleSQLError(res, err, "Error crítico al guardar producto en la base de datos");
  }
});

app.get('/api/productos-todos', async (req, res) => {
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
  try {
    const [results] = await promisePool.query(sql);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error al cargar catálogo");
  }
});

app.get('/api/mis-productos/:id', async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos_rescate WHERE aliado_id = ? ORDER BY id DESC";
  try {
    const [results] = await promisePool.query(sql, [id]);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error al cargar tus productos");
  }
});

app.put('/api/productos/:id/actualizar', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio_original, precio_rescate, stock, imagen_url, categoria, aliado_id } = req.body;
  const catFinal = categoria || 'Preparados';

  const sql = `UPDATE productos_rescate SET nombre = ?, precio_original = ?, precio_rescate = ?, stock = ?, imagen_url = ?, categoria = ? WHERE id = ?`;
  try {
    const [result] = await promisePool.query(sql, [nombre, precio_original, precio_rescate, stock, imagen_url, catFinal, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });
    
    if (aliado_id) {
      const mensajeActividad = `Actualizó los datos de la oferta: ${nombre}`;
      const sqlHistorial = "INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)";
      await promisePool.query(sqlHistorial, [aliado_id, mensajeActividad]).catch(e => console.error(e));
    }
    res.json({ success: true, mensaje: "Producto modificado con éxito" });
  } catch (err) {
    return handleSQLError(res, err, "Error al actualizar producto");
  }
});

app.delete('/api/productos/:id/eliminar', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query("SELECT nombre, aliado_id FROM productos_rescate WHERE id = ?", [id]);
    if (results.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const { nombre, aliado_id } = results[0];
    await promisePool.query("DELETE FROM productos_rescate WHERE id = ?", [id]);

    const mensajeActividad = `Eliminó la oferta del catálogo: ${nombre}`;
    await promisePool.query("INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)", [aliado_id, mensajeActividad]).catch(e => console.error(e));

    res.json({ success: true, mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    return handleSQLError(res, err, "Error al eliminar el producto");
  }
});

// --- GESTIÓN DE PEDIDOS ---
app.post('/api/pedidos/crear', async (req, res) => {
  const { usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, estado, tipo_entrega, costo_domicilio } = req.body;
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const estadoFormateado = (estado || "pendiente").toLowerCase();
  
  try {
    const [resultUpdate] = await promisePool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id]);
    if (resultUpdate.affectedRows === 0) return res.status(400).json({ error: "Sin stock disponible en el establecimiento" });
    
    const sqlPedido = `INSERT INTO pedidos (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado, tipo_entrega, costo_domicilio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    await promisePool.query(sqlPedido, [usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estadoFormateado, tipo_entrega || 'retiro', costo_domicilio || 0]);
    
    await promisePool.query("UPDATE usuarios SET regalo_descuento = 0, regalo_domicilio = 0 WHERE id = ?", [usuario_id]).catch(e => console.error(e));
    res.status(201).json({ mensaje: "Pedido guardado", codigo: codigo_qr });
  } catch (err) {
    return handleSQLError(res, err, "Error al registrar pedido");
  }
});

app.patch('/api/pedidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const estadoFormateado = estado ? estado.toLowerCase() : 'completado';
  try {
    await promisePool.query("UPDATE pedidos SET estado = ? WHERE id = ?", [estadoFormateado, id]);
    res.json({ success: true });
  } catch (err) {
    return handleSQLError(res, err, "Error al actualizar estado");
  }
});

app.get('/api/pedidos/usuario/:id', async (req, res) => {
  const sql = `
    SELECT p.*, p.codigo_qr AS codigo, a.nombre_local, a.direccion, c.puntuacion AS calificacion_guardada
    FROM pedidos p 
    JOIN aliados a ON p.aliado_id = a.id 
    LEFT JOIN calificaciones c ON p.id = c.pedido_id
    WHERE p.usuario_id = ? ORDER BY p.id DESC`;
  try {
    const [results] = await promisePool.query(sql, [req.params.id]);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error al obtener pedidos históricos del usuario");
  }
});

app.get('/api/pedidos/aliado/:id', async (req, res) => {
  const sql = "SELECT p.*, p.codigo_qr AS codigo, u.nombre AS nombre_usuario FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC";
  try {
    const [results] = await promisePool.query(sql, [req.params.id]);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error al obtener pedidos del aliado");
  }
});

app.get('/api/pedidos/validar/:codigo/:aliadoId', async (req, res) => {
  const { codigo, aliadoId } = req.params;
  const sql = `SELECT p.*, p.codigo_qr AS codigo, u.nombre as nombre_usuario FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.codigo_qr = ? AND p.aliado_id = ?`;
  try {
    const [results] = await promisePool.query(sql, [codigo, aliadoId]);
    if (results.length === 0) return res.status(404).json({ mensaje: "Código no encontrado" });
    res.json(results[0]);
  } catch (err) {
    return handleSQLError(res, err, "Error al validar código");
  }
});

app.get('/api/aliados/:id/pedidos-pendientes', async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT p.id, p.codigo_qr AS codigo, p.nombre_producto, p.precio_final, p.estado, p.tipo_entrega, p.costo_domicilio, u.nombre AS cliente_nombre FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? AND p.estado = 'pagado' ORDER BY p.id DESC`;
  try {
    const [results] = await promisePool.query(sql, [id]);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error al obtener pedidos pendientes");
  }
});

app.put('/api/pedidos/:id/entregar', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await promisePool.query("UPDATE pedidos SET estado = 'entregado' WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json({ success: true, mensaje: "Pedido marcado como entregado correctamente" });
  } catch (err) {
    return handleSQLError(res, err, "Error al entregar el pedido");
  }
});

// --- SEGURIDAD ALIMENTARIA ---
app.post('/api/reportar-calidad', async (req, res) => {
  const { pedido_id, usuario_id, aliado_id, motivo, foto_evidencia } = req.body;
  try {
    await promisePool.query("INSERT INTO reportes_calidad (pedido_id, usuario_id, aliado_id, motivo, foto_evidencia) VALUES (?, ?, ?, ?, ?)", [pedido_id, usuario_id, aliado_id, motivo, foto_evidencia]);
    const [results] = await promisePool.query("SELECT COUNT(*) as fallas FROM reportes_calidad WHERE aliado_id = ?", [aliado_id]);
    if (results[0].fallas >= 3) {
      await promisePool.query("UPDATE aliados SET estado_calidad = 'Advertencia' WHERE id = ?", [aliado_id]);
    }
    res.status(201).json({ mensaje: "Reporte recibido" });
  } catch (err) {
    return handleSQLError(res, err, "Error al enviar reporte");
  }
});

// --- ANALÍTICAS ---
app.get('/api/aliados/:id/estadisticas', async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT COUNT(*) as total_rescates, SUM(precio_final) as total_ganado FROM pedidos WHERE aliado_id = ? AND (estado = 'completado' OR estado = 'entregado')";
  try {
    const [results] = await promisePool.query(sql, [id]);
    res.json(results[0] || { total_rescates: 0, total_ganado: 0 });
  } catch (err) {
    return handleSQLError(res, err, "Error en estadísticas");
  }
});

app.get('/api/aliados/:id/ventas-semanales', async (req, res) => {
  const { id } = req.params;
  const sql = `SELECT DATE_FORMAT(fecha, '%d/%m') as fecha, SUM(precio_final) as total FROM pedidos WHERE aliado_id = ? AND (estado = 'completado' OR estado = 'entregado') GROUP BY DATE_FORMAT(fecha, '%d/%m') ORDER BY MIN(fecha) ASC LIMIT 7`;
  try {
    const [results] = await promisePool.query(sql, [id]);
    res.json(results || []);
  } catch (err) {
    return handleSQLError(res, err, "Error en gráfica");
  }
});

app.get('/api/aliados/:id/actividad', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query("SELECT * FROM historial_actividad WHERE aliado_id = ? ORDER BY fecha DESC LIMIT 10", [id]);
    res.json(results || []);
  } catch (err) {
    res.json([]);
  }
});

// --- CALIFICACIONES ---
app.post('/api/calificaciones', async (req, res) => {
  const { pedido_id, aliado_id, puntuacion } = req.body;
  if (!pedido_id || !aliado_id || !puntuacion) return res.status(400).json({ error: "Faltan campos obligatorios" });

  try {
    const [result] = await promisePool.query("INSERT INTO calificaciones (pedido_id, aliado_id, puntuacion) VALUES (?, ?, ?)", [pedido_id, aliado_id, puntuacion]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      await promisePool.query("UPDATE calificaciones SET puntuacion = ? WHERE pedido_id = ?", [puntuacion, pedido_id]);
      return res.json({ success: true, mensaje: "Calificación actualizada" });
    }
    return handleSQLError(res, err, "Error crítico al calificar");
  }
});

// --- LOGIN SEGURO CON IDENTIFICADORES ASIGNADOS ---
app.post('/api/login', async (req, res) => {
  const { correo, password, role } = req.body;
  try {
    if (role === 'vendor') {
      const sql = "SELECT id, nombre_local AS nombre, correo_corporativo AS correo FROM aliados WHERE correo_corporativo = ? AND password_hash = ?";
      const [results] = await promisePool.query(sql, [correo, password]);
      if (results.length > 0) return res.json({ mensaje: "OK", usuario: { ...results[0], role: 'vendor' } });
      else return res.status(401).json({ error: "Credenciales incorrectas" });
    } else {
      const sql = "SELECT id, nombre, correo, regalo_descuento, regalo_domicilio FROM usuarios WHERE correo = ? AND password = ?";
      const [results] = await promisePool.query(sql, [correo, password]);
      if (results.length > 0) return res.json({ mensaje: "OK", usuario: { ...results[0], role: 'user' } });
      else return res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (err) {
    return handleSQLError(res, err, "Error en Login");
  }
});

// LANZAMIENTO
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor AprovechApp corriendo en el puerto ${PORT}`);
});