const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startNotificationWorker } = require('./utils/notificationQueue');
const { startPanelSyncWorker } = require('./utils/panelSyncWorker');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Impor Rute
const ticketRoutes = require('./routes/ticketRoutes');
const forumRoutes = require('./routes/forumRoutes');
const pointRoutes = require('./routes/pointRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const externalRoutes = require('./routes/externalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Origin yang boleh memanggil API dari browser & menyematkan KroomCare dalam iframe (Support Center Panel).
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.set('trust proxy', 'loopback');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Permintaan tanpa Origin (same-origin GET, server-ke-server) selalu boleh; lainnya harus terdaftar.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Cache-Control', 'Pragma']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Framing: hanya panel yang terdaftar (dan KroomCare sendiri) yang boleh menyematkan halaman ini.
const frameAncestors = ["'self'", ...allowedOrigins].join(' ');
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Frame-Options');
  next();
});

// Jalur Rute API
app.use('/api/tickets', ticketRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/notifications', notificationRoutes);

// Realtime SSE Pub/Sub Hub Channels (private-ticket.{id}, presence-staff-notifications, etc.)
const { handleTicketSubscription, handleChannelSubscription, handleStaffSubscription } = require('./utils/realtimeHub');
app.get('/api/realtime/tickets/:id', handleTicketSubscription);
app.get('/api/realtime/staff', handleStaffSubscription);
app.get('/api/realtime/channel/:channel', handleChannelSubscription);

// Dokumentasi Swagger API hanya bila diaktifkan lewat SWAGGER_ENABLED=true
if (process.env.SWAGGER_ENABLED === 'true') {
  const swaggerDocument = YAML.load(path.join(__dirname, 'swagger_spec.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Anti-Cache Middleware for HTML files so iframe updates are always instant
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path.indexOf('.') === -1) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Serve Frontend Static Files (Production Build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// SPA Fallback: semua rute non-API diarahkan ke dist/index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// Middleware penanganan route API yang tidak ditemukan (404)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan.'
  });
});

// Middleware global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Ukuran data terlalu besar.' });
  }
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  // DISABLE_WORKERS=1 untuk instance uji agar tidak ikut mengirim WA / sinkronisasi panel.
  if (process.env.DISABLE_WORKERS !== '1') {
    startNotificationWorker();
    startPanelSyncWorker();
  }
});
