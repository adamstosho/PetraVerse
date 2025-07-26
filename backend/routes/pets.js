const express = require('express');
const router = express.Router();
const {
  createPet,
  getPets,
  getPet,
  updatePet,
  deletePet,
  markAsReunited,
  contactOwner,
  searchNearby,
  getMyPets,
  approvePet
} = require('../controllers/petController');

const {
  protect,
  authorize,
  checkOwnership
} = require('../middlewares/auth');

const {
  validatePet,
  validatePetSearch,
  validateContactRequest,
  validateObjectId,
  validatePagination
} = require('../middlewares/validation');

const { uploadMultiple } = require('../utils/cloudinary');

router.get('/', validatePetSearch, getPets);
router.get('/search/nearby', validatePetSearch, searchNearby);

router.post('/', protect, uploadMultiple, createPet);
router.get('/my-pets', protect, validatePagination, getMyPets);

router.get('/:id', validateObjectId, getPet);
router.post('/:id/contact', validateObjectId, validateContactRequest, contactOwner);
router.put('/:id', protect, validateObjectId, checkOwnership('Pet'), uploadMultiple, validatePet, updatePet);
router.delete('/:id', protect, validateObjectId, checkOwnership('Pet'), deletePet);
router.patch('/:id/reunite', protect, validateObjectId, checkOwnership('Pet'), markAsReunited);

router.patch('/:id/approve', protect, authorize('admin'), validateObjectId, approvePet);

module.exports = router; 