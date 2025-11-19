const Subscription = require('../models/Subscription');
const User = require('../models/user');

// Subscribe to channel
exports.subscribe = async (req, res) => {
    try {
        const { channelId } = req.params;

        // Can't subscribe to yourself
        if (channelId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot subscribe to your own channel'
            });
        }

        // Check if channel exists
        const channel = await User.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if already subscribed
        const existingSubscription = await Subscription.findOne({
            subscriber: req.user.id,
            channel: channelId
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'Already subscribed to this channel'
            });
        }

        // Create subscription
        await Subscription.create({
            subscriber: req.user.id,
            channel: channelId
        });

        // Update user's subscriptions array
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { subscriptions: channelId }
        });

        // Update channel's subscribers array
        await User.findByIdAndUpdate(channelId, {
            $addToSet: { subscribers: req.user.id }
        });

        res.json({
            success: true,
            message: 'Subscribed successfully'
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error subscribing to channel'
        });
    }
};

// Unsubscribe from channel
exports.unsubscribe = async (req, res) => {
    try {
        const { channelId } = req.params;

        const subscription = await Subscription.findOneAndDelete({
            subscriber: req.user.id,
            channel: channelId
        });

        if (!subscription) {
            return res.status(400).json({
                success: false,
                message: 'Not subscribed to this channel'
            });
        }

        // Update user's subscriptions array
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { subscriptions: channelId }
        });

        // Update channel's subscribers array
        await User.findByIdAndUpdate(channelId, {
            $pull: { subscribers: req.user.id }
        });

        res.json({
            success: true,
            message: 'Unsubscribed successfully'
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unsubscribing from channel'
        });
    }
};

// Get user's subscriptions
exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ subscriber: req.user.id })
            .populate('channel', 'username channelName avatar subscriberCount')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            subscriptions
        });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions'
        });
    }
};

// Get channel's subscribers
exports.getSubscribers = async (req, res) => {
    try {
        const { channelId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const subscribers = await Subscription.find({ channel: channelId })
            .populate('subscriber', 'username channelName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Subscription.countDocuments({ channel: channelId });

        res.json({
            success: true,
            subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscribers'
        });
    }
};

// Check subscription status
exports.checkSubscription = async (req, res) => {
    try {
        const { channelId } = req.params;

        const subscription = await Subscription.findOne({
            subscriber: req.user.id,
            channel: channelId
        });

        res.json({
            success: true,
            isSubscribed: !!subscription
        });
    } catch (error) {
        console.error('Check subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking subscription'
        });
    }
};