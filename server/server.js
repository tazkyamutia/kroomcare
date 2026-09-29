const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startNotificationWorker } = require('./utils/notificationQueue');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Jalur Rute API
app.use('/api/tickets', ticketRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/external', externalRoutes);



// Dokumentasi Swagger API
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger_spec.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve Frontend Static Files (Production Build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Fallback: semua rute non-API diarahkan ke dist/index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) {
    return next();
  }
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
});
