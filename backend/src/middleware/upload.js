const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Create upload directories
const imageUploadPath = path.join(__dirname, '../../public/uploads/images');
const audioUploadPath = path.join(__dirname, '../../public/uploads/audio');
createDirIfNotExists(imageUploadPath);
createDirIfNotExists(audioUploadPath);

// Configure storage for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imageUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'word-image-' + uniqueSuffix + ext);
  }
});

// Configure storage for audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'word-audio-' + uniqueSuffix + ext);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// File filter for audio
const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio')) {
    cb(null, true);
  } else {
    cb(new Error('Not an audio file! Please upload only audio files.'), false);
  }
};

// Multer middleware for image uploads
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Multer middleware for audio uploads
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware for handling word uploads (both image and audio)
const wordUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Determine destination based on file type
      if (file.fieldname === 'image') {
        cb(null, imageUploadPath);
      } else if (file.fieldname === 'audio') {
        cb(null, audioUploadPath);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'image' ? 'word-image-' : 'word-audio-';
      cb(null, prefix + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image' && file.mimetype.startsWith('image')) {
      cb(null, true);
    } else if (file.fieldname === 'audio' && file.mimetype.startsWith('audio')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

module.exports = {
  uploadImage,
  uploadAudio,
  wordUpload
}; 