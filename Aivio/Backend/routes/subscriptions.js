const express = require('express');
const {
    subscribe,
    unsubscribe,
    getSubscriptions,
    getSubscribers,
    checkSubscription
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:channelId/subscribe', protect, subscribe);
router.delete('/:channelId/unsubscribe', protect, unsubscribe);
router.get('/my-subscriptions', protect, getSubscriptions);
router.get('/:channelId/subscribers', getSubscribers);
router.get('/:channelId/check', protect, checkSubscription);

module.exports = router;
