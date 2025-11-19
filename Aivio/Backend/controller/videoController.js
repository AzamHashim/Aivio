const Video = require('../models/Video');
const User = require('../models/user');

// Upload video
exports.uploadVideo = async (req, res) => {
    try {
        const { title, description, category, tags, visibility } = req.body;

        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }

        const video = await Video.create({
            title,
            description,
            videoUrl: `/uploads/videos/${req.files.video[0].filename}`,
            thumbnailUrl: req.files.thumbnail ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}` : '/default-thumbnail.jpg',
            duration: req.body.duration || 0,
            owner: req.user.id,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            category,
            visibility
        });

        // Populate owner details
        await video.populate('owner', 'username channelName avatar');

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading video'
        });
    }
};

// Get all videos (with pagination and filters)
exports.getVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const videos = await Video.find({ visibility: 'public', isBlocked: false })
            .populate('owner', 'username channelName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Video.countDocuments({ visibility: 'public', isBlocked: false });

        res.json({
            success: true,
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos'
        });
    }
};

// Get single video
exports.getVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('owner', 'username channelName avatar subscriberCount')
            .populate('likes', 'username channelName avatar')
            .populate('dislikes', 'username channelName avatar');

        if (!video || video.isBlocked) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check visibility
        if (video.visibility === 'private' && (!req.user || video.owner._id.toString() !== req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'This video is private'
            });
        }

        res.json({
            success: true,
            video
        });
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching video'
        });
    }
};

// Update video
exports.updateVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this video'
            });
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('owner', 'username channelName avatar');

        res.json({
            success: true,
            message: 'Video updated successfully',
            video: updatedVideo
        });
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video'
        });
    }
};

// Delete video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check ownership
        if (video.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this video'
            });
        }

        await Video.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting video'
        });
    }
};

// Like video
exports.likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Remove from dislikes if exists
        video.dislikes = video.dislikes.filter(
            dislike => dislike.toString() !== req.user.id
        );

        // Add to likes if not already liked
        if (!video.likes.includes(req.user.id)) {
            video.likes.push(req.user.id);
        } else {
            // Remove like if already liked
            video.likes = video.likes.filter(
                like => like.toString() !== req.user.id
            );
        }

        await video.save();

        res.json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (error) {
        console.error('Like video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking video'
        });
    }
};

// Dislike video
exports.dislikeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Remove from likes if exists
        video.likes = video.likes.filter(
            like => like.toString() !== req.user.id
        );

        // Add to dislikes if not already disliked
        if (!video.dislikes.includes(req.user.id)) {
            video.dislikes.push(req.user.id);
        } else {
            // Remove dislike if already disliked
            video.dislikes = video.dislikes.filter(
                dislike => dislike.toString() !== req.user.id
            );
        }

        await video.save();

        res.json({
            success: true,
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (error) {
        console.error('Dislike video error:', error);
        res.status(500).json({
            success: false,
            message: 'Error disliking video'
        });
    }
};

// Get trending videos
exports.getTrendingVideos = async (req, res) => {
    try {
        const videos = await Video.find({ visibility: 'public', isBlocked: false })
            .populate('owner', 'username channelName avatar')
            .sort({ views: -1, likes: -1 })
            .limit(20);

        res.json({
            success: true,
            videos
        });
    } catch (error) {
        console.error('Get trending videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending videos'
        });
    }
};

// Search videos
exports.searchVideos = async (req, res) => {
    try {
        const { q, category } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { visibility: 'public', isBlocked: false };

        if (q) {
            query.$text = { $search: q };
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        const videos = await Video.find(query)
            .populate('owner', 'username channelName avatar')
            .sort({ score: { $meta: 'textScore' }, views: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Video.countDocuments(query);

        res.json({
            success: true,
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching videos'
        });
    }
};

// Get videos by category
exports.getVideosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const videos = await Video.find({ 
            category, 
            visibility: 'public', 
            isBlocked: false 
        })
            .populate('owner', 'username channelName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Video.countDocuments({ 
            category, 
            visibility: 'public', 
            isBlocked: false 
        });

        res.json({
            success: true,
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get videos by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category videos'
        });
    }
};

// Increment views
exports.incrementViews = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        await video.incrementViews();

        // Add to user's watch history if authenticated
        if (req.user) {
            await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    watchHistory: {
                        video: video._id,
                        watchedAt: new Date()
                    }
                }
            });
        }

        res.json({
            success: true,
            views: video.views
        });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({
            success: false,
            message: 'Error incrementing views'
        });
    }
};