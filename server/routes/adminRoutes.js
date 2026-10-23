const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin, requireStaffOrAdmin } = require('../middleware/auth');
const { 
  getAdminStats, 
  getAllUsers, 
  createUser, 
  deleteUser, 
  getUserPointHistoryAdmin,
  getStaffDashboardStats,
  resetUserPoints,
  getApiKey,
  generateApiKey,
  getWhatsAppConfig,
  updateWhatsAppConfig,
  testWhatsAppNotification,
  getStaffList
} = require('../controllers/adminController');

router.use(requireAuth);

// Statistik dashboard staff boleh diakses staff maupun admin
router.get('/stats/staff', requireStaffOrAdmin, getStaffDashboardStats);

// Daftar staff untuk pilihan penugasan tiket (staff/admin)
router.get('/staff', requireStaffOrAdmin, getStaffList);

// Seluruh rute di bawah ini khusus administrator
router.use(requireAdmin);

// Route untuk mendapatkan seluruh data statistik admin dashboard
router.get('/stats', getAdminStats);

// Route manajemen pengguna admin
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/points', getUserPointHistoryAdmin);
router.put('/users/:id/reset-points', resetUserPoints);

// Route pengaturan integrasi API Key KroomCare
router.get('/api-key', getApiKey);
router.post('/api-key/generate', generateApiKey);

// Route konfigurasi WhatsApp Gateway (Kroomhook)
router.get('/whatsapp-config', getWhatsAppConfig);
router.post('/whatsapp-config', updateWhatsAppConfig);
router.post('/whatsapp-test', testWhatsAppNotification);

module.exports = router;


