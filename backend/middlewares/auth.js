const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      if (!req.user.isActive) {
        res.status(401);
        throw new Error('Account is deactivated');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }

    next();
  };
};

const checkOwnership = (modelName) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id;
    const Model = require(`../models/${modelName}`);
    
    const resource = await Model.findById(resourceId);
    
    if (!resource) {
      res.status(404);
      throw new Error(`${modelName} not found`);
    }

    if (req.user.role === 'admin') {
      req.resource = resource;
      return next();
    }

    const ownerField = modelName === 'User' ? '_id' : 'owner';
    if (resource[ownerField].toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this resource');
    }

    req.resource = resource;
    next();
  });
};

const authRateLimit = {
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyEmailToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    res.status(400);
    throw new Error('Email verification token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(400);
      throw new Error('Invalid email verification token');
    }

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error('Email is already verified');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400);
    throw new Error('Invalid or expired email verification token');
  }
});

const verifyPasswordResetToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    res.status(400);
    throw new Error('Password reset token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(400);
      throw new Error('Invalid password reset token');
    }

    if (!user.passwordResetToken || user.passwordResetToken !== token) {
      res.status(400);
      throw new Error('Invalid password reset token');
    }

    if (user.passwordResetExpires < Date.now()) {
      res.status(400);
      throw new Error('Password reset token has expired');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }
});

module.exports = {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
  authRateLimit,
  generateToken,
  verifyEmailToken,
  verifyPasswordResetToken
}; 