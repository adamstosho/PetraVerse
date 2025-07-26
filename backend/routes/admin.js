const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
  approvePet,
  getAllReports,
  getReportById,
  updateReport,
  getDashboardStats
} = require('../controllers/adminController');

const {
  protect,
  authorize
} = require('../middlewares/auth');

const {
  validatePagination,
  validateObjectId
} = require('../middlewares/validation');

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', validatePagination, getAllUsers);
router.get('/users/:id', validateObjectId, getUserById);
router.put('/users/:id', validateObjectId, updateUser);
router.delete('/users/:id', validateObjectId, deleteUser);

// Pet management
router.get('/pets', validatePagination, getAllPets);
router.get('/pets/:id', validateObjectId, getPetById);
router.put('/pets/:id', validateObjectId, updatePet);
router.patch('/pets/:id/approve', validateObjectId, approvePet);
router.delete('/pets/:id', validateObjectId, deletePet);

// Report management
router.get('/reports', validatePagination, getAllReports);
router.get('/reports/:id', validateObjectId, getReportById);
router.put('/reports/:id', validateObjectId, updateReport);

module.exports = router; 