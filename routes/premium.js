const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();
require('dotenv').config();

const middleware = require('../middleware/auth');
const User = require('../models/users');
const Order = require('../models/order');
const Expense = require('../models/expense'); // For leaderboard

// Buy Premium Route
router.get('/buy-premium', middleware, async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 149000;

        const order = await rzp.orders.create({ amount, currency: 'INR' });

        const newOrder = new Order({
            orderId: order.id,
            status: "PENDING",
            user: req.user._id
        });

        await newOrder.save();

        return res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
});

// Update transaction status
router.post('/updatetransectionstatus', middleware, async (req, res) => {
    const { order_id, payment_id } = req.body;

    try {
        const order = await Order.findOne({ orderId: order_id });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentId = payment_id;
        order.status = 'successful';
        await order.save();

        req.user.isPremiumUser = true;
        await req.user.save();

        res.status(202).json({ success: true, message: 'Transaction successful' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
});

// Check premium status
router.get('/check-premium-status', middleware, async (req, res) => {
    try {
        const isPremium = req.user.isPremiumUser;
        return res.status(200).json({ isPremium });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error checking premium status', error: err.message });
    }
});

// Leaderboard route
router.get('/premium/LeaderBoard', middleware, async (req, res) => {
    try {
        const leaderboardData = await Expense.aggregate([
            {
                $group: {
                    _id: "$userId",
                    total_cost: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 0,
                    id: "$userDetails._id",
                    name: "$userDetails.name",
                    total_cost: 1
                }
            },
            {
                $sort: { total_cost: -1 }
            }
        ]);

        res.status(200).json(leaderboardData);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to fetch leaderboard", error: err.message });
    }
});

module.exports = router;
