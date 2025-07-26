const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotification
} = require('../controllers/notificationController');

const {
  protect
} = require('../middlewares/auth');

const {
  validatePagination,
  validateObjectId
} = require('../middlewares/validation');

router.use(protect);

router.get('/', validatePagination, getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', validateObjectId, markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', validateObjectId, deleteNotification);
router.get('/:id', validateObjectId, getNotification);

module.exports = router; 