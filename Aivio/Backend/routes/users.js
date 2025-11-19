const express = require('express');
const {
    getUserProfile,
    getUserVideos,
    getUserLikedVideos,
    getWatchHistory,
    clearWatchHistory
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:username', getUserProfile);
router.get('/:username/videos', getUserVideos);
router.get('/me/liked-videos', protect, getUserLikedVideos);
router.get('/me/watch-history', protect, getWatchHistory);
router.delete('/me/watch-history', protect, clearWatchHistory);

module.exports = router;