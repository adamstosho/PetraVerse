const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

const uploadSingle = upload.single('image');

const uploadMultiple = upload.array('photos', 10); 

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

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

const deleteMultipleImages = async (imageUrls) => {
  try {
    const deletePromises = imageUrls.map(imageUrl => {
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        console.warn('Invalid Cloudinary URL:', imageUrl);
        return Promise.resolve(null);
      }
      
      const publicIdParts = urlParts.slice(uploadIndex + 2); 
      let publicId = publicIdParts.join('/');
      
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

const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image info from Cloudinary:', error);
    throw error;
  }
};

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

const generateThumbnailUrl = (publicId, width = 200, height = 200) => {
  return transformImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto'
  });
};

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

const optimizeForWeb = (publicId) => {
  return transformImageUrl(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    flags: 'progressive'
  });
};

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

const cleanupUnusedImages = async (usedPublicIds) => {
  try {
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