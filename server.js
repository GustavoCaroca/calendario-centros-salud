const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Inicializar base de datos
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS centros_salud (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(255),
        telefono VARCHAR(20),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS actividades (
        id SERIAL PRIMARY KEY,
        centro_id INTEGER REFERENCES centros_salud(id),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        estado VARCHAR(20) DEFAULT 'programada',
        usuario_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hojas_ruta (
        id SERIAL PRIMARY KEY,
        actividad_id INTEGER REFERENCES actividades(id),
        contenido JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar datos iniciales
    await insertInitialData();
    
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

async function insertInitialData() {
  try {
    // Verificar si ya existen datos
    const existingCentros = await pool.query('SELECT COUNT(*) FROM centros_salud');
    
    if (existingCentros.rows[0].count === '0') {
      // Insertar centros de salud
      const centros = [
        'Centro de Salud Norte',
        'Centro de Salud Sur',
        'Centro de Salud Este',
        'Centro de Salud Oeste',
        'Centro de Salud Central',
        'Centro de Salud Periférico'
      ];

      for (const centro of centros) {
        await pool.query(
          'INSERT INTO centros_salud (nombre) VALUES ($1)',
          [centro]
        );
      }
    }

    // Crear usuario administrador por defecto
    const existingAdmin = await pool.query('SELECT id FROM usuarios WHERE username = $1', ['admin']);
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO usuarios (username, password, nombre, role) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'Administrador', 'admin']
      );
    }
  } catch (error) {
    console.error('Error al insertar datos iniciales:', error);
  }
}

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, username, password, nombre, role FROM usuarios WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de centros de salud
app.get('/api/centros', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM centros_salud WHERE activo = true ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener centros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de actividades
app.get('/api/actividades', authenticateToken, async (req, res) => {
  try {
    const { mes, año, centro_id } = req.query;
    
    let query = `
      SELECT a.*, c.nombre as centro_nombre, u.nombre as usuario_nombre
      FROM actividades a
      JOIN centros_salud c ON a.centro_id = c.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (mes && año) {
      query += ` AND EXTRACT(MONTH FROM a.fecha) = $${paramCount} AND EXTRACT(YEAR FROM a.fecha) = $${paramCount + 1}`;
      params.push(mes, año);
      paramCount += 2;
    }

    if (centro_id) {
      query += ` AND a.centro_id = $${paramCount}`;
      params.push(centro_id);
    }

    query += ' ORDER BY a.fecha, a.hora_inicio';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/actividades', authenticateToken, async (req, res) => {
  try {
    const { centro_id, titulo, descripcion, fecha, hora_inicio, hora_fin } = req.body;
    
    const result = await pool.query(
      `INSERT INTO actividades (centro_id, titulo, descripcion, fecha, hora_inicio, hora_fin, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [centro_id, titulo, descripcion, fecha, hora_inicio, hora_fin, req.user.id]
    );

    const actividad = result.rows[0];
    
    // Emitir evento de socket para tiempo real
    io.emit('nueva_actividad', actividad);
    
    res.status(201).json(actividad);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/actividades/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, hora_inicio, hora_fin, estado } = req.body;
    
    const result = await pool.query(
      `UPDATE actividades 
       SET titulo = $1, descripcion = $2, fecha = $3, hora_inicio = $4, hora_fin = $5, estado = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [titulo, descripcion, fecha, hora_inicio, hora_fin, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    const actividad = result.rows[0];
    
    // Emitir evento de socket para tiempo real
    io.emit('actividad_actualizada', actividad);
    
    res.json(actividad);
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/actividades/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM actividades WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Emitir evento de socket para tiempo real
    io.emit('actividad_eliminada', { id });
    
    res.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para generar hoja de ruta
app.post('/api/hojas-ruta', authenticateToken, async (req, res) => {
  try {
    const { actividad_id, contenido } = req.body;
    
    const result = await pool.query(
      'INSERT INTO hojas_ruta (actividad_id, contenido) VALUES ($1, $2) RETURNING *',
      [actividad_id, JSON.stringify(contenido)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear hoja de ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/hojas-ruta/:actividad_id', authenticateToken, async (req, res) => {
  try {
    const { actividad_id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM hojas_ruta WHERE actividad_id = $1 ORDER BY created_at DESC LIMIT 1',
      [actividad_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hoja de ruta no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener hoja de ruta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejar todas las demás rutas con React en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Inicializar servidor
const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});

// Manejo de errores
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
