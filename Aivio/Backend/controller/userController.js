const User = require('../models/user');
const Video = require('../models/Video');

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .select('-password -email')
            .populate('subscribers', 'username channelName avatar')
            .populate('subscriptions', 'username channelName avatar');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's video count
        const videoCount = await Video.countDocuments({ 
            owner: user._id, 
            visibility: 'public',
            isBlocked: false 
        });

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                videoCount
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

// Get user's videos
exports.getUserVideos = async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if requesting own videos
        const isOwnVideos = req.user && req.user.id === user._id.toString();

        let query = { owner: user._id, isBlocked: false };
        if (!isOwnVideos) {
            query.visibility = 'public';
        }

        const videos = await Video.find(query)
            .populate('owner', 'username channelName avatar')
            .sort({ createdAt: -1 })
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
        console.error('Get user videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user videos'
        });
    }
};

// Get user's liked videos
exports.getUserLikedVideos = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('likedVideos');
        
        const videos = await Video.find({
            _id: { $in: user.likedVideos },
            isBlocked: false
        })
            .populate('owner', 'username channelName avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            videos
        });
    } catch (error) {
        console.error('Get liked videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching liked videos'
        });
    }
};

// Get watch history
exports.getWatchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'watchHistory.video',
                populate: {
                    path: 'owner',
                    select: 'username channelName avatar'
                }
            })
            .select('watchHistory');

        // Sort by most recent
        user.watchHistory.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

        res.json({
            success: true,
            watchHistory: user.watchHistory
        });
    } catch (error) {
        console.error('Get watch history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch history'
        });
    }
};

// Clear watch history
exports.clearWatchHistory = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            watchHistory: []
        });

        res.json({
            success: true,
            message: 'Watch history cleared successfully'
        });
    } catch (error) {
        console.error('Clear watch history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing watch history'
        });
    }
};