const express = require('express');
const {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/video/:videoId', getComments);
router.post('/video/:videoId', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

module.exports = router;