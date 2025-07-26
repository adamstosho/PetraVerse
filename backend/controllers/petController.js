const asyncHandler = require('express-async-handler');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { deleteMultipleImages } = require('../utils/cloudinary');


const createPet = asyncHandler(async (req, res) => {
  console.log('Files received:', req.files);
  console.log('Body received:', req.body);
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
  });

  const photos = req.files ? req.files.map(file => {
    console.log('File object:', file);
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

  if (!lastSeenLocation.coordinates) {
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: [0, 0] 
    };
  } else if (lastSeenLocation.coordinates && !lastSeenLocation.coordinates.coordinates) {
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: [0, 0] 
    };
  } else if (Array.isArray(lastSeenLocation.coordinates)) {
    lastSeenLocation.coordinates = {
      type: 'Point',
      coordinates: lastSeenLocation.coordinates
    };
  }

  if (lastSeenLocation.coordinates && lastSeenLocation.coordinates.coordinates) {
    const coords = lastSeenLocation.coordinates.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2 || 
        typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
      lastSeenLocation.coordinates = {
        type: 'Point',
        coordinates: [0, 0] 
      };
    }
  }

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

  if (status) query.status = status;
  if (type) query.type = type;
  if (breed) query.breed = { $regex: breed, $options: 'i' };
  if (color) query.color = { $regex: color, $options: 'i' };
  if (gender) query.gender = gender;

  if (dateFrom || dateTo) {
    query.lastSeenDate = {};
    if (dateFrom) query.lastSeenDate.$gte = new Date(dateFrom);
    if (dateTo) query.lastSeenDate.$lte = new Date(dateTo);
  }

  if (latitude && longitude) {
    query['lastSeenLocation.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseFloat(radius) * 1000 
      }
    };
  }

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


const getPet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id)
    .populate('owner', 'name email phone')
    .populate('approvedBy', 'name');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (!pet.isActive) {
    res.status(404);
    throw new Error('Pet post not found or has been removed');
  }

  await pet.incrementViews();

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

  const newPhotos = req.files ? req.files.map(file => {
    console.log('File object:', file);
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

  if (req.user.role !== 'admin') {
    pet.isApproved = false;
    pet.approvedBy = undefined;
    pet.approvedAt = undefined;
  }

  const updatedPet = await pet.save();
  await updatedPet.populate('owner', 'name email phone');

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

const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this pet');
  }

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

const markAsReunited = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

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

  await pet.incrementContactCount();

  try {
    const contactInfo = { name, email, phone, message };
    await sendEmail(pet.owner.email, 'contactRequest', pet.owner.name, pet.name, contactInfo);
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500);
    throw new Error('Error sending contact email');
  }

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