const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/videos', 'uploads/thumbnails', 'uploads/avatars'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Video upload configuration
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Thumbnail upload configuration
const thumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/thumbnails/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Avatar upload configuration
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filters
const videoFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Upload instances
const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

const uploadThumbnail = multer({
    storage: thumbnailStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

module.exports = {
    uploadVideo,
    uploadThumbnail,
    uploadAvatar
};