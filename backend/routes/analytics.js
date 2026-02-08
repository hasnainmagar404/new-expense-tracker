const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/analytics/summary
// @desc    Get summary statistics
// @access  Private
router.get('/summary', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: thirtyDaysAgo }
        });

        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        res.json({
            success: true,
            data: {
                income,
                expenses,
                balance: income - expenses,
                transactionCount: transactions.length
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/analytics/by-category
// @desc    Get spending by category
// @access  Private
router.get('/by-category', async (req, res, next) => {
    try {
        const userId = req.user._id;

        const categoryData = await Transaction.aggregate([
            { $match: { userId, amount: { $lt: 0 } } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: { $abs: '$amount' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        const totalSpending = categoryData.reduce((sum, cat) => sum + cat.total, 0);

        const categories = categoryData.map(cat => ({
            category: cat._id,
            amount: cat.total,
            count: cat.count,
            percentage: totalSpending > 0 ? Math.round((cat.total / totalSpending) * 100) : 0
        }));

        res.json({
            success: true,
            data: { categories, totalSpending }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/analytics/trends
// @desc    Get monthly income vs expenses for last 6 months
// @access  Private
router.get('/trends', async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    income: {
                        $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] }
                    },
                    expenses: {
                        $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const trends = monthlyData.map(item => ({
            month: `${months[item._id.month - 1]} ${item._id.year}`,
            income: item.income,
            expenses: item.expenses
        }));

        res.json({
            success: true,
            data: { trends }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
