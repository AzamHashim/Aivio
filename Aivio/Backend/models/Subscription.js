const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique subscription
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
