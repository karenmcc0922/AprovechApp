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

// Registro inicial con validación exacta de Pioneros (Primeros 100) inmune a IDs altos
app.post('/api/registro', (req, res) => {
  const { nombre, correo } = req.body;
  
  // 1. Consultamos el conteo real de filas físicas en la base de datos
  pool.query("SELECT COUNT(*) as total_usuarios FROM usuarios", (err, results) => {
    if (err) {
      console.error("❌ Error contando usuarios para validar pioneros:", err);
      return res.status(500).json({ error: "Error interno en el servidor" });
    }
    
    const totalActual = results[0].total_usuarios;
    // Si hay menos de 100 registros en la BD, este nuevo califica como Pionero (true = 1)
    const esPionero = totalActual < 100 ? 1 : 0;

    const sql = "INSERT INTO usuarios (nombre, correo, regalo_descuento, regalo_domicilio) VALUES (?, ?, ?, ?)";
    pool.query(sql, [nombre, correo, esPionero, esPionero], (err) => {
      if (err) {
        return res.status(500).json({ 
          error: err.code === 'ER_DUP_ENTRY' ? "Correo ya existe" : "Error DB" 
        });
      }
      res.status(201).json({ 
        mensaje: "Pre-registro exitoso",
        pionero: esPionero === 1
      });
    });
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

// Actualizar información del perfil del usuario (Configuración de Cuenta - Optimizado)
app.put('/api/usuarios/:id/actualizar', (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, direccion } = req.body;

  if (!nombre || !telefono || !direccion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const sql = "UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?";
  
  pool.query(sql, [nombre, telefono, direccion, id], (err, result) => {
    if (err) {
      // Almacena el log exacto en la consola de Render para auditoría del desarrollador
      console.error("❌ Error detallado al actualizar usuario en BD:", err);
      return handleSQLError(res, err, "Error interno en el servidor al actualizar la cuenta");
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ success: true, mensaje: "Perfil actualizado con éxito" });
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

app.get('/api/aliados/:id/panel-privado', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT nombre_local, nit, correo_corporativo, direccion FROM aliados WHERE id = ?";
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener perfil del aliado");
    if (results.length === 0) return res.status(404).json({ error: "No se encontró el establecimiento" });
    res.json(results[0]);
  });
});

app.put('/api/aliados/:id/actualizar', (req, res) => {
  const { id } = req.params;
  const { nombre_local, direccion } = req.body;
  const sql = "UPDATE aliados SET nombre_local = ?, direccion = ? WHERE id = ?";
  pool.query(sql, [nombre_local, direccion, id], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al actualizar la base de datos");
    res.json({ success: true, mensaje: "Establecimiento modificado con éxito" });
  });
});

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

// --- PRODUCTOS (MODIFICADOS PARA GUARDAR CONSTANCIA EN EL HISTORIAL) ---
app.post('/api/productos', (req, res) => {
  const { aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria } = req.body;
  const catFinal = categoria || 'Preparados';

  const sql = `INSERT INTO productos_rescate 
               (aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, categoria) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
               
  pool.query(sql, [aliado_id, nombre, precio_original, precio_rescate, stock, imagen_url, catFinal], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al guardar producto en la base de datos");
    
    // GUARDAR CONSTANCIA DE CREACIÓN EN LA ACTIVIDAD RECIENTE
    const mensajeActividad = `Publicó una nueva oferta: ${nombre} (${stock} und.)`;
    const sqlHistorial = "INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)";
    
    pool.query(sqlHistorial, [aliado_id, mensajeActividad], (historialErr) => {
      if (historialErr) console.error("⚠️ No se pudo registrar la creación en el historial:", historialErr);
    });

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

// Editar un producto existente del aliado con registro de actividad
app.put('/api/productos/:id/actualizar', (req, res) => {
  const { id } = req.params;
  const { nombre, precio_original, precio_rescate, stock, imagen_url, categoria, aliado_id } = req.body;
  const catFinal = categoria || 'Preparados';

  const sql = `
    UPDATE productos_rescate 
    SET nombre = ?, precio_original = ?, precio_rescate = ?, stock = ?, imagen_url = ?, categoria = ? 
    WHERE id = ?
  `;

  pool.query(sql, [nombre, precio_original, precio_rescate, stock, imagen_url, catFinal, id], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al actualizar the product");
    if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });
    
    // GUARDAR CONSTANCIA DE EDICIÓN EN LA ACTIVIDAD RECIENTE
    if (aliado_id) {
      const mensajeActividad = `Actualizó los datos de la oferta: ${nombre}`;
      const sqlHistorial = "INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)";
      
      pool.query(sqlHistorial, [aliado_id, mensajeActividad], (historialErr) => {
        if (historialErr) console.error("⚠️ No se pudo registrar la actualización en el historial:", historialErr);
      });
    }

    res.json({ success: true, mensaje: "Producto modificado con éxito" });
  });
});

// Eliminar un producto del catálogo con búsqueda previa para el registro de actividad
app.delete('/api/productos/:id/eliminar', (req, res) => {
  const { id } = req.params;

  // 1. Buscamos los datos indispensables del producto antes de destruirlo
  const sqlBuscar = "SELECT nombre, aliado_id FROM productos_rescate WHERE id = ?";
  
  pool.query(sqlBuscar, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al buscar producto antes de eliminar");
    if (results.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

    const { nombre, aliado_id } = results[0];

    // 2. Procedemos a eliminar físicamente el producto
    const sqlDelete = "DELETE FROM productos_rescate WHERE id = ?";
    pool.query(sqlDelete, [id], (deleteErr, result) => {
      if (deleteErr) return handleSQLError(res, deleteErr, "Error al eliminar el producto");
      
      // 3. GUARDAR CONSTANCIA DE ELIMINACIÓN EN LA ACTIVIDAD RECIENTE
      const mensajeActividad = `Eliminó la oferta del catálogo: ${nombre}`;
      const sqlHistorial = "INSERT INTO historial_actividad (aliado_id, descripcion) VALUES (?, ?)";
      
      pool.query(sqlHistorial, [aliado_id, mensajeActividad], (historialErr) => {
        if (historialErr) console.error("⚠️ No se pudo registrar la eliminación en el historial:", historialErr);
      });

      res.json({ success: true, mensaje: "Producto eliminado correctamente" });
    });
  });
});

// --- GESTIÓN DE PEDIDOS (MODIFICADO CON LEFT JOIN PARA EXTRACTO DE CALIFICACIÓN REAL) ---
app.post('/api/pedidos/crear', (req, res) => {
  const { 
    usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, 
    precio_final, estado, tipo_entrega, costo_domicilio 
  } = req.body;
  
  const codigo_qr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const estadoFormateado = (estado || "pendiente").toLowerCase();
  
  // Resta automática en inventario (RF-08)
  pool.query("UPDATE productos_rescate SET stock = stock - 1 WHERE id = ? AND stock > 0", [producto_id], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).json({ error: "Sin stock disponible en el establecimiento" });
    
    // Inserción incluyendo el control logístico del pedido
    const sqlPedido = `INSERT INTO pedidos 
      (usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, precio_final, codigo_qr, estado, tipo_entrega, costo_domicilio) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
    pool.query(sqlPedido, [
      usuario_id, producto_id, aliado_id, nombre_usuario, nombre_producto, 
      precio_final, codigo_qr, estadoFormateado, tipo_entrega || 'retiro', costo_domicilio || 0
    ], (err) => {
      if (err) return handleSQLError(res, err, "Error al registrar pedido");
      
      // Post-Verificación: Si consumió sus regalos de pionero, se los desactivamos para futuras compras
      pool.query("UPDATE usuarios SET regalo_descuento = 0, regalo_domicilio = 0 WHERE id = ?", [usuario_id], (updateErr) => {
        if (updateErr) console.error("⚠️ No se pudieron limpiar las banderas VIP del usuario:", updateErr);
      });

      res.status(201).json({ mensaje: "Pedido guardado", codigo: codigo_qr });
    });
  });
});

app.patch('/api/pedidos/:id/estado', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const estadoFormateado = estado ? estado.toLowerCase() : 'completado';
  
  const sql = "UPDATE pedidos SET estado = ? WHERE id = ?";
  pool.query(sql, [estadoFormateado, id], (err) => {
    if (err) return handleSQLError(res, err, "Error al actualizar estado");
    res.json({ success: true });
  });
});

// ENDPOINT ESTRATÉGICO ACTUALIZADO: Une la tabla pedidos con la tabla calificaciones
app.get('/api/pedidos/usuario/:id', (req, res) => {
  const sql = `
    SELECT 
      p.*, 
      p.codigo_qr AS codigo, 
      a.nombre_local, 
      a.direccion,
      c.puntuacion AS calificacion_guardada
    FROM pedidos p 
    JOIN aliados a ON p.aliado_id = a.id 
    LEFT JOIN calificaciones c ON p.id = c.pedido_id
    WHERE p.usuario_id = ? 
    ORDER BY p.id DESC
  `;
  
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener pedidos históricos del usuario");
    res.json(results || []);
  });
});

app.get('/api/pedidos/aliado/:id', (req, res) => {
  const sql = "SELECT p.*, p.codigo_qr AS codigo, u.nombre AS nombre_usuario FROM pedidos p JOIN usuarios u ON p.usuario_id = u.id WHERE p.aliado_id = ? ORDER BY p.id DESC";
  pool.query(sql, [req.params.id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener pedidos del aliado");
    res.json(results);
  });
});

app.get('/api/pedidos/validar/:codigo/:aliadoId', (req, res) => {
  const { codigo, aliadoId } = req.params;
  const sql = `
    SELECT p.*, p.codigo_qr AS codigo, u.nombre as nombre_usuario 
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

// Obtener pedidos pagados con tarjeta y pendientes por entregar
app.get('/api/aliados/:id/pedidos-pendientes', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.codigo_qr AS codigo, p.nombre_producto, p.precio_final, p.estado, p.tipo_entrega, p.costo_domicilio, u.nombre AS cliente_nombre 
    FROM pedidos p 
    JOIN usuarios u ON p.usuario_id = u.id 
    WHERE p.aliado_id = ? AND p.estado = 'pagado'
    ORDER BY p.id DESC
  `;
  pool.query(sql, [id], (err, results) => {
    if (err) return handleSQLError(res, err, "Error al obtener pedidos pendientes");
    res.json(results || []);
  });
});

// Marcar pedido como entregado (Acción directa del comercio por medio del ID oculto)
app.put('/api/pedidos/:id/entregar', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE pedidos SET estado = 'entregado' WHERE id = ?";
  pool.query(sql, [id], (err, result) => {
    if (err) return handleSQLError(res, err, "Error al despacho/entregar el pedido");
    if (result.affectedRows === 0) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json({ success: true, mensaje: "Pedido marcado como entregado correctamente" });
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

// --- ANALÍTICAS (MÉTRICAS UNIFICADAS EN MINÚSCULAS) ---
app.get('/api/aliados/:id/estadisticas', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT COUNT(*) as total_rescates, SUM(precio_final) as total_ganado FROM pedidos WHERE aliado_id = ? AND (estado = 'completado' OR estado = 'entregado')";
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
    WHERE aliado_id = ? AND (estado = 'completado' OR estado = 'entregado')
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

// --- ENDPOINT DE CALIFICACIONES CON TABLA PROPIA (RF-13) ---
app.post('/api/calificaciones', (req, res) => {
  const { pedido_id, aliado_id, puntuacion } = req.body;

  if (!pedido_id || !aliado_id || !puntuacion) {
    return res.status(400).json({ error: "Faltan campos obligatorios (pedido_id, aliado_id, puntuacion)" });
  }

  const sqlInsert = "INSERT INTO calificaciones (pedido_id, aliado_id, puntuacion) VALUES (?, ?, ?)";
  
  pool.query(sqlInsert, [pedido_id, aliado_id, puntuacion], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        const sqlUpdate = "UPDATE calificaciones SET puntuacion = ? WHERE pedido_id = ?";
        return pool.query(sqlUpdate, [puntuacion, pedido_id], (updateErr) => {
          if (updateErr) return handleSQLError(res, updateErr, "Error al actualizar la estrella existente");
          return res.status(200).json({ success: true, mensaje: "Calificación actualizada correctamente" });
        });
      }
      return handleSQLError(res, err, "Error crítico al guardar en la tabla calificaciones");
    }

    res.status(201).json({ success: true, mensaje: "Calificación creada con éxito", id: result.insertId });
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
    const sql = "SELECT id, nombre, correo, regalo_descuento, regalo_domicilio FROM usuarios WHERE correo = ? AND password = ?";
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