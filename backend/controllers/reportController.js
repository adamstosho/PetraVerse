const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');

const createReport = asyncHandler(async (req, res) => {
  const {
    type,
    reason,
    description,
    reportedUserId,
    reportedPetId,
    evidence
  } = req.body;

  if (!reportedUserId && !reportedPetId) {
    res.status(400);
    throw new Error('Must specify either a user or pet to report');
  }

  if (reportedUserId && reportedUserId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot report yourself');
  }

  if (reportedPetId) {
    const pet = await Pet.findById(reportedPetId);
    if (pet && pet.owner.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot report your own pet post');
    }
  }

  const existingReport = await Report.findOne({
    reporter: req.user._id,
    $or: [
      { reportedUser: reportedUserId },
      { reportedPet: reportedPetId }
    ],
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
  });

  if (existingReport) {
    res.status(400);
    throw new Error('You have already reported this recently. Please wait 24 hours before reporting again.');
  }

  const report = await Report.create({
    reporter: req.user._id,
    type,
    reason,
    description,
    reportedUser: reportedUserId,
    reportedPet: reportedPetId,
    evidence
  });

  const populatedReport = await report.populate([
    { path: 'reporter', select: 'name email' },
    { path: 'reportedUser', select: 'name email' },
    { path: 'reportedPet', select: 'name type breed' }
  ]);

  try {
    await Notification.createNotification({
      recipient: req.user._id,
      type: 'report_received',
      title: 'Report received',
      message: `We have received your report about ${type}. Our moderation team will review it.`,
      relatedReport: report._id
    });

    await sendEmail(req.user.email, 'reportReceived', {
      userName: req.user.name,
      reportType: type
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: {
      report: populatedReport
    }
  });
});

const getUserReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  let query = {
    $or: [
      { reporter: req.user._id },
      { reportedUser: req.user._id }
    ]
  };

  if (status) {
    query.status = status;
  }

  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedUser', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 })
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

const getReport = asyncHandler(async (req, res) => {
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

  if (report.reporter.toString() !== req.user._id.toString() && 
      report.reportedUser.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this report');
  }

  res.json({
    success: true,
    data: {
      report
    }
  });
});

const updateReport = asyncHandler(async (req, res) => {
  const { reason, description, evidence } = req.body;

  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  if (report.reporter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this report');
  }

  if (report.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot update a report that has been reviewed');
  }

  if (reason) report.reason = reason;
  if (description !== undefined) report.description = description;
  if (evidence) report.evidence = evidence;

  const updatedReport = await report.save();
  await updatedReport.populate([
    { path: 'reporter', select: 'name email' },
    { path: 'reportedUser', select: 'name email' },
    { path: 'reportedPet', select: 'name type breed' }
  ]);

  res.json({
    success: true,
    message: 'Report updated successfully',
    data: {
      report: updatedReport
    }
  });
});

const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  if (report.reporter.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this report');
  }

  if (report.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot delete a report that has been reviewed');
  }

  await Report.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

const getReportsAboutMe = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  let query = { reportedUser: req.user._id };

  if (status) {
    query.status = status;
  }

  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .populate('actionTakenBy', 'name email')
    .sort({ createdAt: -1 })
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

const getReportsAboutMyPets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const userPets = await Pet.find({ owner: req.user._id }).select('_id');
  const petIds = userPets.map(pet => pet._id);

  let query = { reportedPet: { $in: petIds } };

  if (status) {
    query.status = status;
  }

  const reports = await Report.find(query)
    .populate('reporter', 'name email')
    .populate('reportedPet', 'name type breed')
    .populate('reviewedBy', 'name email')
    .populate('actionTakenBy', 'name email')
    .sort({ createdAt: -1 })
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

module.exports = {
  createReport,
  getUserReports,
  getReport,
  updateReport,
  deleteReport,
  getReportsAboutMe,
  getReportsAboutMyPets
}; 