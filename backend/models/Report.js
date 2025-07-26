const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedPet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  type: {
    type: String,
    enum: ['user', 'pet_post', 'spam', 'inappropriate', 'fake', 'duplicate', 'other'],
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  evidence: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot be more than 1000 characters']
  },
  action: {
    type: String,
    enum: ['none', 'warn_user', 'delete_post', 'disable_user', 'ban_user', 'other'],
    default: 'none'
  },
  actionTakenAt: Date,
  actionTakenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedPet: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ isResolved: 1 });

reportSchema.virtual('isUserReport').get(function() {
  return this.type === 'user' || this.reportedUser;
});

reportSchema.virtual('isPetReport').get(function() {
  return this.type === 'pet_post' || this.reportedPet;
});

reportSchema.methods.assignToAdmin = function(adminId) {
  this.status = 'under_review';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  return this.save();
};

reportSchema.methods.resolve = function(data) {
  this.status = 'resolved';
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.action = data.action || 'none';
  this.actionTakenAt = new Date();
  this.actionTakenBy = data.adminId;
  this.resolutionNotes = data.notes;
  return this.save();
};

reportSchema.methods.dismiss = function(adminId, notes) {
  this.status = 'dismissed';
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.resolutionNotes = notes;
  return this.save();
};

reportSchema.statics.getReportsByStatus = function(status, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({ status })
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .populate('actionTakenBy', 'name email');
};

reportSchema.statics.getPendingCount = function() {
  return this.countDocuments({ status: 'pending' });
};

reportSchema.statics.getHighPriorityReports = function() {
  return this.find({
    priority: { $in: ['high', 'urgent'] },
    status: { $in: ['pending', 'under_review'] }
  })
  .sort({ priority: -1, createdAt: -1 })
  .populate('reporter', 'name email')
  .populate('reportedUser', 'name email')
  .populate('reportedPet', 'name type breed');
};

reportSchema.statics.getReportsByUser = function(userId) {
  return this.find({
    $or: [
      { reporter: userId },
      { reportedUser: userId }
    ]
  })
  .sort({ createdAt: -1 })
  .populate('reporter', 'name email')
  .populate('reportedUser', 'name email')
  .populate('reportedPet', 'name type breed');
};

reportSchema.statics.getReportsByPet = function(petId) {
  return this.find({ reportedPet: petId })
    .sort({ createdAt: -1 })
    .populate('reporter', 'name email')
    .populate('reviewedBy', 'name email');
};

reportSchema.statics.hasRecentReports = function(userId, days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.countDocuments({
    reportedUser: userId,
    createdAt: { $gte: cutoffDate },
    status: { $in: ['pending', 'under_review'] }
  });
};

module.exports = mongoose.model('Report', reportSchema); 