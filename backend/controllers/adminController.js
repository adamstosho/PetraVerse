const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { deleteMultipleImages } = require('../utils/cloudinary');

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isActive, search } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate({
      path: 'pets',
      select: 'name type breed status isApproved createdAt'
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role, isActive, isEmailVerified } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString() && role && role !== user.role) {
    res.status(400);
    throw new Error('Cannot modify your own role');
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: updatedUser.getPublicProfile()
    }
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  user.isActive = false;
  await user.save();

  await Pet.updateMany(
    { owner: user._id },
    { isActive: false }
  );

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

const getAllPets = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    isApproved, 
    isActive, 
    search,
    owner 
  } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) query.status = status;
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (owner) query.owner = owner;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { breed: { $regex: search, $options: 'i' } },
      { color: { $regex: search, $options: 'i' } }
    ];
  }

  const pets = await Pet.find(query)
    .populate('owner', 'name email phone')
    .populate('approvedBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Pet.countDocuments(query);

  res.json({
    success: true,
    data: {
      pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('approvedBy', 'name');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  res.json({
    success: true,
    data: {
      pet
    }
  });
});

const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const {
    name,
    type,
    breed,
    color,
    gender,
    age,
    ageUnit,
    weight,
    weightUnit,
    status,
    lastSeenLocation,
    lastSeenDate,
    additionalNotes,
    microchipNumber,
    collar,
    tags,
    isApproved,
    isActive
  } = req.body;

  if (name) pet.name = name;
  if (type) pet.type = type;
  if (breed) pet.breed = breed;
  if (color) pet.color = color;
  if (gender) pet.gender = gender;
  if (age !== undefined) pet.age = age;
  if (ageUnit) pet.ageUnit = ageUnit;
  if (weight !== undefined) pet.weight = weight;
  if (weightUnit) pet.weightUnit = weightUnit;
  if (status) pet.status = status;
  if (lastSeenLocation) pet.lastSeenLocation = lastSeenLocation;
  if (lastSeenDate) pet.lastSeenDate = lastSeenDate;
  if (additionalNotes !== undefined) pet.additionalNotes = additionalNotes;
  if (microchipNumber !== undefined) pet.microchipNumber = microchipNumber;
  if (collar) pet.collar = collar;
  if (tags) pet.tags = tags;
  if (isApproved !== undefined) pet.isApproved = isApproved;
  if (isActive !== undefined) pet.isActive = isActive;

  if (isApproved && !pet.isApproved) {
    pet.approvedBy = req.user._id;
    pet.approvedAt = new Date();
  }

  const updatedPet = await pet.save();
  await updatedPet.populate('owner', 'name email phone');

  if (isApproved && !pet.isApproved) {
    try {
      await Notification.createNotification({
        recipient: pet.owner._id,
        sender: req.user._id,
        type: 'post_approved',
        title: 'Your pet post has been approved',
        message: `Your post about ${pet.name} has been approved and is now live.`,
        relatedPet: pet._id
      });

      await sendEmail(pet.owner.email, 'postApproved', {
        userName: pet.owner.name,
        petName: pet.name
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  res.json({
    success: true,
    message: 'Pet updated successfully',
    data: {
      pet: updatedPet
    }
  });
});

const approvePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (pet.isApproved) {
    res.status(400);
    throw new Error('Pet is already approved');
  }

  pet.isApproved = true;
  pet.approvedBy = req.user._id;
  pet.approvedAt = new Date();

  const updatedPet = await pet.save();
  await updatedPet.populate('owner', 'name email phone');
  await updatedPet.populate('approvedBy', 'name');

  try {
    await Notification.createNotification({
      recipient: pet.owner._id,
      sender: req.user._id,
      type: 'post_approved',
      title: 'Your pet post has been approved',
      message: `Your post about ${pet.name} has been approved and is now live.`,
      relatedPet: pet._id
    });

    await sendEmail(pet.owner.email, 'postApproved', {
      userName: pet.owner.name,
      petName: pet.name
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }

  res.json({
    success: true,
    message: 'Pet approved successfully',
    data: {
      pet: updatedPet
    }
  });
});

const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  // Delete photos from Cloudinary
  if (pet.photos && pet.photos.length > 0) {
    try {
      await deleteMultipleImages(pet.photos);
    } catch (error) {
      console.error('Error deleting photos from Cloudinary:', error);
    }
  }

  await Pet.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Pet deleted successfully'
  });
});

const getAllReports = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    type, 
    priority,
    reporter,
    reportedUser,
    reportedPet 
  } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (reporter) query.reporter = reporter;
  if (reportedUser) query.reportedUser = reportedUser;
  if (reportedPet) query.reportedPet = reportedPet;

  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .populate('actionTakenBy', 'name email')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Report.countDocuments(query);

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .populate('actionTakenBy', 'name email');

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  res.json({
    success: true,
    data: {
      report
    }
  });
});

const updateReport = asyncHandler(async (req, res) => {
  const { status, priority, adminNotes, action, resolutionNotes } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Validate status if provided
  if (status && !['pending', 'under_review', 'resolved', 'dismissed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  // Validate priority if provided
  if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    res.status(400);
    throw new Error('Invalid priority value');
  }

  if (status) report.status = status;
  if (priority) report.priority = priority;
  if (adminNotes !== undefined) report.adminNotes = adminNotes;
  if (action) report.action = action;
  if (resolutionNotes !== undefined) report.resolutionNotes = resolutionNotes;

  if (status === 'resolved' && !report.isResolved) {
    report.isResolved = true;
    report.resolvedAt = new Date();
    report.actionTakenBy = req.user._id;
    report.actionTakenAt = new Date();
  }

  if (status === 'dismissed' && !report.isResolved) {
    report.isResolved = true;
    report.resolvedAt = new Date();
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
  }

  const updatedReport = await report.save();
  await updatedReport.populate('reporter', 'name email');

  if (status === 'resolved' && !report.isResolved) {
    try {
      await Notification.createNotification({
        recipient: report.reporter._id,
        sender: req.user._id,
        type: 'report_resolved',
        title: 'Your report has been resolved',
        message: `Your report has been resolved. Action taken: ${action || 'none'}`,
        relatedReport: report._id
      });

      await sendEmail(report.reporter.email, 'reportResolved', {
        userName: report.reporter.name,
        reportType: report.type,
        action: action || 'none'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  res.json({
    success: true,
    message: 'Report updated successfully',
    data: {
      report: updatedReport
    }
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalPets,
    approvedPets,
    pendingPets,
    totalReports,
    pendingReports,
    highPriorityReports,
    recentUsers,
    recentPets,
    recentReports
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Pet.countDocuments(),
    Pet.countDocuments({ isApproved: true }),
    Pet.countDocuments({ isApproved: false }),
    Report.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ 
      priority: { $in: ['high', 'urgent'] },
      status: { $in: ['pending', 'under_review'] }
    }),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
    Pet.find().sort({ createdAt: -1 }).limit(5).populate('owner', 'name'),
    Report.find().sort({ createdAt: -1 }).limit(5).populate('reporter', 'name')
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        totalPets,
        approvedPets,
        pendingPets,
        totalReports,
        pendingReports,
        highPriorityReports
      },
      recent: {
        users: recentUsers,
        pets: recentPets,
        reports: recentReports
      }
    }
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllPets,
  getPetById,
  updatePet,
  approvePet,
  deletePet,
  getAllReports,
  getReportById,
  updateReport,
  getDashboardStats
}; 