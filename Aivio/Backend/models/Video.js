const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
        default: ''
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    thumbnailUrl: {
        type: String,
        required: [true, 'Thumbnail URL is required']
    },
    duration: {
        type: Number, // in seconds
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['music', 'gaming', 'education', 'entertainment', 'comedy', 'technology', 'sports', 'news', 'other'],
        default: 'other'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for dislike count
videoSchema.virtual('dislikeCount').get(function() {
    return this.dislikes.length;
});

// Index for search
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Increment views
videoSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

module.exports = mongoose.model('Video', videoSchema);