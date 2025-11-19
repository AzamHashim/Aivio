const express = require('express');
const {
    uploadVideo,
    getVideos,
    getVideo,
    updateVideo,
    deleteVideo,
    likeVideo,
    dislikeVideo,
    getTrendingVideos,
    searchVideos,
    getVideosByCategory,
    incrementViews
} = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadVideo: uploadVideoMiddleware, uploadThumbnail } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, uploadVideoMiddleware.single('video'), uploadThumbnail.single('thumbnail'), uploadVideo);
router.get('/', optionalAuth, getVideos);
router.get('/trending', optionalAuth, getTrendingVideos);
router.get('/search', optionalAuth, searchVideos);
router.get('/category/:category', optionalAuth, getVideosByCategory);
router.get('/:id', optionalAuth, getVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, likeVideo);
router.post('/:id/dislike', protect, dislikeVideo);
router.post('/:id/view', optionalAuth, incrementViews);

module.exports = router;