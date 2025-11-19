const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Register user
exports.register = async (req, res) => {
    try {
        const { username, email, password, channelName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            channelName: channelName || username
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                channelName: user.channelName,
                avatar: user.avatar,
                subscriberCount: user.subscriberCount
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in registration'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                channelName: user.channelName,
                avatar: user.avatar,
                subscriberCount: user.subscriberCount
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in login'
        });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('subscribers', 'username channelName avatar')
            .populate('subscriptions', 'username channelName avatar');

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                channelName: user.channelName,
                channelDescription: user.channelDescription,
                avatar: user.avatar,
                subscriberCount: user.subscriberCount,
                subscribers: user.subscribers,
                subscriptions: user.subscriptions,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { channelName, channelDescription } = req.body;
        const updateData = {};

        if (channelName) updateData.channelName = channelName;
        if (channelDescription) updateData.channelDescription = channelDescription;
        if (req.file) updateData.avatar = `/uploads/avatars/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                channelName: user.channelName,
                channelDescription: user.channelDescription,
                avatar: user.avatar,
                subscriberCount: user.subscriberCount
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};
