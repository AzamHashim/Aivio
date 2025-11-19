const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: null
    },
    channelName: {
        type: String,
        default: function() {
            return this.username;
        }
    },
    channelDescription: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    watchHistory: [{
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        },
        watchedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get subscriber count
userSchema.virtual('subscriberCount').get(function() {
    return this.subscribers.length;
});

module.exports = mongoose.model('User', userSchema);