const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    maxlength: [50, 'Pet name cannot be more than 50 characters']
  },
  type: {
    type: String,
    enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'],
    required: [true, 'Pet type is required']
  },
  breed: {
    type: String,
    required: [true, 'Pet breed is required'],
    trim: true,
    maxlength: [100, 'Breed cannot be more than 100 characters']
  },
  color: {
    type: String,
    required: [true, 'Pet color is required'],
    trim: true,
    maxlength: [100, 'Color cannot be more than 100 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    required: [true, 'Pet gender is required']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [30, 'Age cannot be more than 30 years']
  },
  ageUnit: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years'],
    default: 'years'
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  photos: [{
    type: String,
    required: [true, 'At least one photo is required']
  }],
  status: {
    type: String,
    enum: ['missing', 'found', 'reunited'],
    required: [true, 'Pet status is required']
  },
  lastSeenLocation: {
    address: {
      type: String,
      required: [true, 'Last seen address is required'],
      trim: true,
      maxlength: [200, 'Address cannot be more than 200 characters']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: false, // Make coordinates optional
        validate: {
          validator: function(v) {
            if (!v) return true; // Allow empty coordinates
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates'
        }
      }
    },
    city: String,
    state: String,
    zipCode: String
  },
  lastSeenDate: {
    type: Date,
    required: [true, 'Last seen date is required']
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Additional notes cannot be more than 1000 characters']
  },
  microchipNumber: {
    type: String,
    trim: true
  },
  collar: {
    hasCollar: {
      type: Boolean,
      default: false
    },
    color: String,
    description: String
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  contactCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
petSchema.index({ status: 1 });
petSchema.index({ type: 1 });
petSchema.index({ breed: 1 });
petSchema.index({ color: 1 });
petSchema.index({ 'lastSeenLocation.coordinates': '2dsphere' });
petSchema.index({ lastSeenDate: -1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ isApproved: 1 });
petSchema.index({ isActive: 1 });
petSchema.index({ owner: 1 });

// Virtual for age display
petSchema.virtual('ageDisplay').get(function() {
  if (!this.age) return 'Unknown';
  return `${this.age} ${this.ageUnit}`;
});

// Virtual for weight display
petSchema.virtual('weightDisplay').get(function() {
  if (!this.weight) return 'Unknown';
  return `${this.weight} ${this.weightUnit}`;
});

// Virtual for full location
petSchema.virtual('fullLocation').get(function() {
  const location = this.lastSeenLocation;
  if (!location) return '';
  
  const parts = [location.address, location.city, location.state, location.zipCode];
  return parts.filter(part => part).join(', ');
});

// Method to increment views
petSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment contact count
petSchema.methods.incrementContactCount = function() {
  this.contactCount += 1;
  return this.save();
};

// Method to approve post
petSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

// Method to mark as reunited
petSchema.methods.markAsReunited = function() {
  this.status = 'reunited';
  return this.save();
};

// Static method to find pets within radius
petSchema.statics.findNearby = function(coordinates, radiusInKm = 10) {
  return this.find({
    'lastSeenLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    isActive: true,
    isApproved: true
  });
};

// Static method to search pets
petSchema.statics.searchPets = function(filters) {
  const query = { isActive: true, isApproved: true };
  
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.breed) query.breed = { $regex: filters.breed, $options: 'i' };
  if (filters.color) query.color = { $regex: filters.color, $options: 'i' };
  if (filters.gender) query.gender = filters.gender;
  
  if (filters.dateFrom || filters.dateTo) {
    query.lastSeenDate = {};
    if (filters.dateFrom) query.lastSeenDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.lastSeenDate.$lte = new Date(filters.dateTo);
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Pet', petSchema); 