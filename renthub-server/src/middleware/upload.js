import multer from 'multer';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';

// Make sure the local upload target exists before Multer writes to it.
fs.mkdirSync('uploads', { recursive: true });

// Allowed file types for apartment images
const allowedFileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Configure Multer storage with Cloudinary upload
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename using timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, `apartment-${uniqueSuffix}.${extension}`);
  },
});

/**
 * Multer filter to validate file type
 */
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

/**
 * Multer upload middleware for apartment images.
 * - Validates file type
 * - Validates file size (max 5MB)
 * - Uploads to Cloudinary
 * - Removes local file after Cloudinary upload
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 images per apartment
  },
});

/**
 * Single image upload handler.
 * Uploads the file to Cloudinary and returns the URL and public_id.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    if (!isCloudinaryConfigured()) {
      // If Cloudinary is not configured, save the local file path
      return next();
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'renthub/apartments',
      use_filename: true,
      unique_filename: false,
      resource_type: 'image',
    });

    // Remove the local upload file after successful Cloudinary upload
    import('fs').then(fs => {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    // Attach Cloudinary result to request for controller to use
    req.cloudinaryResult = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };

    next();
  } catch (error) {
    // Clean up local file on error
    import('fs').then(fs => {
      try {
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    next(error);
  }
};

/**
 * Multiple images upload handler.
 * Uploads multiple files to Cloudinary and returns results for all.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    // Images are optional for create/update, so an empty selection is a no-op.
    if (!req.files || req.files.length === 0) {
      return next();
    }

    if (!isCloudinaryConfigured()) {
      // If Cloudinary is not configured, just proceed with local files
      return next();
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'renthub/apartments',
        use_filename: true,
        unique_filename: false,
        resource_type: 'image',
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    // Collect successful uploads and clean up failures
    const cloudinaryResults = [];
    const cleanupFiles = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const uploadResult = result.value;
        cloudinaryResults.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      } else {
        // Add failed file to cleanup list
        if (req.files[index]) {
          cleanupFiles.push(req.files[index].path);
        }
      }
    });

    // Clean up all local files once Cloudinary has them
    import('fs').then(fs => {
      try {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    });

    // Attach Cloudinary results to request
    req.cloudinaryResults = cloudinaryResults;

    next();
  } catch (error) {
    // Clean up local files on error
    import('fs').then(fs => {
      try {
        if (req.files) {
          req.files.forEach((file) => {
            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              // Ignore cleanup errors
            }
          });
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    next(error);
  }
};

/**
 * Delete Cloudinary image asset.
 * @param {string} publicId - Cloudinary public ID to delete
 * @returns {Promise<boolean>} - Success status
 */
const deleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId || !isCloudinaryConfigured()) {
      return true; // Nothing to delete if no publicId or Cloudinary not configured
    }

    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error);
    return false;
  }
};

const isCloudinaryConfigured = () => !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  deleteCloudinaryImage,
  isCloudinaryConfigured,
};
export default {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  deleteCloudinaryImage,
  isCloudinaryConfigured,
};