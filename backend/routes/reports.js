const express = require('express');
const router = express.Router();
const {
  createReport,
  getUserReports,
  getReport,
  updateReport,
  deleteReport,
  getReportsAboutMe,
  getReportsAboutMyPets
} = require('../controllers/reportController');

const {
  protect
} = require('../middlewares/auth');

const {
  validateReport,
  validatePagination,
  validateObjectId
} = require('../middlewares/validation');

router.use(protect);

router.post('/', validateReport, createReport);
router.get('/', validatePagination, getUserReports);
router.get('/about-me', validatePagination, getReportsAboutMe);
router.get('/about-my-pets', validatePagination, getReportsAboutMyPets);
router.get('/:id', validateObjectId, getReport);
router.put('/:id', validateObjectId, validateReport, updateReport);
router.delete('/:id', validateObjectId, deleteReport);

module.exports = router; 