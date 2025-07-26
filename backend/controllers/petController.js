const asyncHandler = require('express-async-handler');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { deleteMultipleImages } = require('../utils/cloudinary');

// @desc    Create a new pet post
// @route   POST /api/pets
// @access  Private
const createPet = asyncHandler(async (req, res) => {
  // Debug: Log what we're receiving
  console.log('Files received:', req.files);
  console.log('Body received:', req.body);
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
  });

  // Handle photo uploads
  const photos = req.files ? req.files.map(file => {
    console.log('File object:', file);
    // CloudinaryStorage might return different structures
    if (file.secure_url) {
      return file.secure_url;
    } else if (file.url) {
      return file.url;
    } else if (file.path) {
      return file.path;
    } else {
      console.error('Unknown file structure:', file);
      return null;
    }
  }).filter(url => url !== null) : [];

  console.log('Photos array:', photos);

  if (photos.length === 0) {
    res.status(400);
    throw new Error('At least one photo is required');
  }

  // Parse FormData fields that might be JSON strings
  let lastSeenLocation = req.body.lastSeenLocation;
  if (typeof lastSeenLocation === 'string') {
    try {
      lastSeenLocation = JSON.parse(lastSeenLocation);
    } catch (error) {
      res.status(400);
      throw new Error('Invalid location data format');
    }
  }

  let collar = req.body.collar;
  if (typeof collar === 'string') {
    try {
      collar = JSON.parse(collar);
    } catch (error) {
      collar = { hasCollar: false };
    }
  }

  let tags = req.body.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (error) {
      tags = [];
    }
  }

  // Set default coordinates if not provided
  if (!lastSeenLocation.coordinates) {
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: [0, 0] // Default coordinates
    };
  } else if (lastSeenLocation.coordinates && !lastSeenLocation.coordinates.coordinates) {
    // If coordinates object exists but doesn't have the coordinates array
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: [0, 0] // Default coordinates
    };
  } else if (Array.isArray(lastSeenLocation.coordinates)) {
    // If coordinates is just an array, wrap it properly
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: lastSeenLocation.coordinates
    };
  }

  // Ensure coordinates array has exactly 2 numbers
  if (lastSeenLocation.coordinates && lastSeenLocation.coordinates.coordinates) {
    const coords = lastSeenLocation.coordinates.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2 || 
        typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
      lastSeenLocation.coordinates = {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      };
    }
  }

  // Validate required fields manually
  if (!req.body.name || req.body.name.trim().length === 0) {
    res.status(400);
    throw new Error('Pet name is required');
  }

  if (!req.body.type || !['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'].includes(req.body.type)) {
    res.status(400);
    throw new Error('Valid pet type is required');
  }

  if (!req.body.breed || req.body.breed.trim().length === 0) {
    res.status(400);
    throw new Error('Breed is required');
  }

  if (!req.body.color || req.body.color.trim().length === 0) {
    res.status(400);
    throw new Error('Color is required');
  }

  if (!req.body.gender || !['male', 'female', 'unknown'].includes(req.body.gender)) {
    res.status(400);
    throw new Error('Valid gender is required');
  }

  if (!req.body.status || !['missing', 'found', 'reunited'].includes(req.body.status)) {
    res.status(400);
    throw new Error('Valid status is required');
  }

  if (!lastSeenLocation.address || lastSeenLocation.address.trim().length === 0) {
    res.status(400);
    throw new Error('Address is required');
  }

  if (lastSeenLocation.address.length > 200) {
    res.status(400);
    throw new Error('Address must be between 1 and 200 characters');
  }

  if (!req.body.lastSeenDate) {
    res.status(400);
    throw new Error('Last seen date is required');
  }

  const pet = await Pet.create({
    owner: req.user._id,
    name: req.body.name.trim(),
    type: req.body.type,
    breed: req.body.breed.trim(),
    color: req.body.color.trim(),
    gender: req.body.gender,
    age: req.body.age ? parseFloat(req.body.age) : undefined,
    ageUnit: req.body.ageUnit || 'years',
    weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
    weightUnit: req.body.weightUnit || 'kg',
    status: req.body.status,
    photos,
    lastSeenLocation,
    lastSeenDate: new Date(req.body.lastSeenDate),
    additionalNotes: req.body.additionalNotes ? req.body.additionalNotes.trim() : undefined,
    microchipNumber: req.body.microchipNumber ? req.body.microchipNumber.trim() : undefined,
    collar,
    tags
  });

  // Auto-approve for admin users
  if (req.user.role === 'admin') {
    pet.isApproved = true;
    pet.approvedBy = req.user._id;
    pet.approvedAt = new Date();
    await pet.save();
  }

  const populatedPet = await pet.populate('owner', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Pet post created successfully',
    data: {
      pet: populatedPet
    }
  });
});

// @desc    Get all pets with filters
// @route   GET /api/pets
// @access  Public
const getPets = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    breed,
    color,
    gender,
    dateFrom,
    dateTo,
    latitude,
    longitude,
    radius = 10,
    page = 1,
    limit = 20
  } = req.query;

  const skip = (page - 1) * limit;

  let query = { isActive: true };

  // Apply filters
  if (status) query.status = status;
  if (type) query.type = type;
  if (breed) query.breed = { $regex: breed, $options: 'i' };
  if (color) query.color = { $regex: color, $options: 'i' };
  if (gender) query.gender = gender;

  // Date range filter
  if (dateFrom || dateTo) {
    query.lastSeenDate = {};
    if (dateFrom) query.lastSeenDate.$gte = new Date(dateFrom);
    if (dateTo) query.lastSeenDate.$lte = new Date(dateTo);
  }

  // Location-based search
  if (latitude && longitude) {
    query['lastSeenLocation.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
      }
    };
  }

  // Only show approved pets to non-admin users
  if (!req.user || req.user.role !== 'admin') {
    query.isApproved = true;
  }

  const pets = await Pet.find(query)
    .populate('owner', 'name email phone')
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

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Public
const getPet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('approvedBy', 'name');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  // For a lost & found network, all pet posts should be publicly viewable
  // Only hide posts that are inactive or deleted
  if (!pet.isActive) {
    res.status(404);
    throw new Error('Pet post not found or has been removed');
  }

  // Increment views
  await pet.incrementViews();

  res.json({
    success: true,
    data: {
      pet
    }
  });
});

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  // Check ownership or admin
  if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this pet');
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
    tags
  } = req.body;

  // Handle photo uploads
  const newPhotos = req.files ? req.files.map(file => {
    console.log('File object:', file);
    // CloudinaryStorage might return different structures
    if (file.secure_url) {
      return file.secure_url;
    } else if (file.url) {
      return file.url;
    } else if (file.path) {
      return file.path;
    } else {
      console.error('Unknown file structure:', file);
      return null;
    }
  }).filter(url => url !== null) : [];
  const existingPhotos = req.body.photos ? JSON.parse(req.body.photos) : pet.photos;
  const photos = [...existingPhotos, ...newPhotos];

  // Update pet
  pet.name = name || pet.name;
  pet.type = type || pet.type;
  pet.breed = breed || pet.breed;
  pet.color = color || pet.color;
  pet.gender = gender || pet.gender;
  pet.age = age !== undefined ? age : pet.age;
  pet.ageUnit = ageUnit || pet.ageUnit;
  pet.weight = weight !== undefined ? weight : pet.weight;
  pet.weightUnit = weightUnit || pet.weightUnit;
  pet.status = status || pet.status;
  pet.photos = photos;
  pet.lastSeenLocation = lastSeenLocation || pet.lastSeenLocation;
  pet.lastSeenDate = lastSeenDate || pet.lastSeenDate;
  pet.additionalNotes = additionalNotes !== undefined ? additionalNotes : pet.additionalNotes;
  pet.microchipNumber = microchipNumber !== undefined ? microchipNumber : pet.microchipNumber;
  pet.collar = collar || pet.collar;
  pet.tags = tags || pet.tags;

  // Reset approval status if updated by non-admin
  if (req.user.role !== 'admin') {
    pet.isApproved = false;
    pet.approvedBy = undefined;
    pet.approvedAt = undefined;
  }

  const updatedPet = await pet.save();
  await updatedPet.populate('owner', 'name email phone');

  // Send notification to owner if edited by admin
  if (req.user.role === 'admin' && pet.owner.toString() !== req.user._id.toString()) {
    try {
      await Notification.createNotification({
        recipient: pet.owner,
        sender: req.user._id,
        type: 'post_edited',
        title: 'Your pet post has been edited',
        message: `Your post about ${pet.name} has been edited by an administrator.`,
        relatedPet: pet._id
      });

      await sendEmail(pet.owner.email, 'postEdited', {
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

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  // Check ownership or admin
  if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this pet');
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

// @desc    Mark pet as reunited
// @route   PATCH /api/pets/:id/reunite
// @access  Private
const markAsReunited = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  // Check ownership or admin
  if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this pet');
  }

  pet.status = 'reunited';
  await pet.save();

  res.json({
    success: true,
    message: 'Pet marked as reunited',
    data: {
      pet
    }
  });
});

// @desc    Contact pet owner
// @route   POST /api/pets/:id/contact
// @access  Public
const contactOwner = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'name email phone');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (!pet.isApproved) {
    res.status(403);
    throw new Error('Cannot contact owner of unapproved post');
  }

  // Increment contact count
  await pet.incrementContactCount();

  // Send email to pet owner
  try {
    const contactInfo = { name, email, phone, message };
    await sendEmail(pet.owner.email, 'contactRequest', pet.owner.name, pet.name, contactInfo);
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500);
    throw new Error('Error sending contact email');
  }

  // Create notification
  try {
    await Notification.createNotification({
      recipient: pet.owner._id,
      type: 'contact_request',
      title: 'New contact request',
      message: `Someone is interested in your post about ${pet.name}.`,
      relatedPet: pet._id,
      metadata: { contactInfo: { name, email, phone, message } }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }

  res.json({
    success: true,
    message: 'Contact request sent successfully'
  });
});

// @desc    Search pets by location
// @route   GET /api/pets/search/nearby
// @access  Public
const searchNearby = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10, page = 1, limit = 20 } = req.query;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const skip = (page - 1) * limit;
  const coordinates = [parseFloat(longitude), parseFloat(latitude)];

  const pets = await Pet.findNearby(coordinates, parseFloat(radius))
    .populate('owner', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit));

  // Use the same aggregation for counting to avoid geospatial query conflicts
  const totalResult = await Pet.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates
        },
        distanceField: 'distance',
        maxDistance: parseFloat(radius) * 1000,
        spherical: true
      }
    },
    {
      $match: {
        isActive: true,
        isApproved: true
      }
    },
    {
      $count: 'total'
    }
  ]);

  const total = totalResult.length > 0 ? totalResult[0].total : 0;

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

const getMyPets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const pets = await Pet.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Pet.countDocuments({ owner: req.user._id });

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

// @desc    Approve pet post (admin only)
// @route   PATCH /api/pets/:id/approve
// @access  Private/Admin
const approvePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'name email');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  pet.isApproved = true;
  pet.approvedBy = req.user._id;
  pet.approvedAt = new Date();
  await pet.save();

  // Send notification to owner
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
    message: 'Pet post approved successfully',
    data: {
      pet
    }
  });
});

module.exports = {
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
}; 