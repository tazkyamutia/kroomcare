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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Framing & CORS headers untuk Kroombox Panel Embed
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Cache-Control, Pragma');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.removeHeader('X-Frame-Options');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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



// Dokumentasi Swagger API
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger_spec.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
    error: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  startNotificationWorker();
  startPanelSyncWorker(60000);
});
