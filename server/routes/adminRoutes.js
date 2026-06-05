const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getAllUsers, 
  createUser, 
  deleteUser, 
  getUserPointHistoryAdmin,
  getStaffDashboardStats
} = require('../controllers/adminController');

// Route untuk mendapatkan seluruh data statistik admin dashboard
router.get('/stats', getAdminStats);

// Route untuk statistik staff dashboard
router.get('/stats/staff', getStaffDashboardStats);

// Route manajemen pengguna admin
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/points', getUserPointHistoryAdmin);

module.exports = router;
