const Comment = require('../models/Comment');
const Video = require('../models/Video');

// Get comments for a video
exports.getComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ 
            video: videoId, 
            parentComment: null 
        })
            .populate('author', 'username channelName avatar')
            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: 'username channelName avatar'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ 
            video: videoId, 
            parentComment: null 
        });

        res.json({
            success: true,
            comments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { content, parentComment } = req.body;

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const comment = await Comment.create({
            content,
            author: req.user.id,
            video: videoId,
            parentComment: parentComment || null
        });

        await comment.populate('author', 'username channelName avatar');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
};

// Update comment
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment.content = req.body.content;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('author', 'username channelName avatar');

        res.json({
            success: true,
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating comment'
        });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Also delete replies
        await Comment.deleteMany({ parentComment: comment._id });
        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
};

// Like comment
exports.likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Toggle like
        const likeIndex = comment.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(req.user.id);
        }

        await comment.save();

        res.json({
            success: true,
            likes: comment.likes.length
        });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking comment'
        });
    }
};