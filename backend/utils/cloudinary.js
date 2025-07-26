const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pet-adoption',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload single image
const uploadSingle = upload.single('image');

// Upload multiple images
const uploadMultiple = upload.array('photos', 10); // Max 10 images

// Upload image with custom options
const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'pet-adoption',
      transformation: [
        { width: options.width || 800, height: options.height || 600, crop: 'limit' },
        { quality: options.quality || 'auto' },
        { fetch_format: options.format || 'auto' }
      ],
      ...options
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw error;
  }
};

// Delete image by public_id
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete multiple images
const deleteMultipleImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(imageUrl => {
      // Extract public ID from Cloudinary URL
      // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        console.warn('Invalid Cloudinary URL:', imageUrl);
        return Promise.resolve(null);
      }
      
      // Get everything after 'upload' and before the file extension
      const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
      let publicId = publicIdParts.join('/');
      
      // Remove file extension
      const lastDotIndex = publicId.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        publicId = publicId.substring(0, lastDotIndex);
      }
      
      return deleteImage(publicId);
    });
    
    const results = await Promise.all(deletePromises);
    return results.filter(result => result !== null);
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw error;
  }
};

// Get image info
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image info from Cloudinary:', error);
    throw error;
  }
};

// Transform image URL
const transformImageUrl = (publicId, options = {}) => {
  try {
    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto',
      fetch_format: 'auto'
    };

    const transformOptions = { ...defaultOptions, ...options };
    return cloudinary.url(publicId, transformOptions);
  } catch (error) {
    console.error('Error transforming image URL:', error);
    throw error;
  }
};

// Generate thumbnail URL
const generateThumbnailUrl = (publicId, width = 200, height = 200) => {
  return transformImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto'
  });
};

// Generate responsive image URLs
const generateResponsiveUrls = (publicId) => {
  const sizes = [
    { width: 320, height: 240, suffix: 'sm' },
    { width: 640, height: 480, suffix: 'md' },
    { width: 800, height: 600, suffix: 'lg' },
    { width: 1200, height: 900, suffix: 'xl' }
  ];

  return sizes.map(size => ({
    url: transformImageUrl(publicId, size),
    width: size.width,
    height: size.height,
    suffix: size.suffix
  }));
};

// Optimize image for web
const optimizeForWeb = (publicId) => {
  return transformImageUrl(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    flags: 'progressive'
  });
};

// Create image with watermark
const addWatermark = (publicId, watermarkText = 'Pet Adoption Network') => {
  return transformImageUrl(publicId, {
    overlay: {
      font_family: 'Arial',
      font_size: 20,
      font_weight: 'bold',
      text: watermarkText,
      color: 'white',
      opacity: 70
    },
    gravity: 'south_east',
    x: 10,
    y: 10
  });
};

// Clean up unused images (helper function)
const cleanupUnusedImages = async (usedPublicIds) => {
  try {
    // This would require additional logic to track unused images
    // For now, this is a placeholder for future implementation
    console.log('Cleanup function called with used public IDs:', usedPublicIds);
  } catch (error) {
    console.error('Error cleaning up unused images:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadSingle,
  uploadMultiple,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageInfo,
  transformImageUrl,
  generateThumbnailUrl,
  generateResponsiveUrls,
  optimizeForWeb,
  addWatermark,
  cleanupUnusedImages
}; 