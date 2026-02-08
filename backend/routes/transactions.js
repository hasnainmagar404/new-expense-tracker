const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const { category, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

        // Build query
        const query = { userId: req.user._id };

        if (category) {
            query.category = category;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Build sort
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;

        const transactions = await Transaction.find(query).sort(sort);

        res.json({
            success: true,
            data: {
                transactions,
                count: transactions.length
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', async (req, res, next) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        res.json({ success: true, data: { transaction } });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', [
    body('text').trim().notEmpty().withMessage('Description is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').isIn(['Food', 'Transport', 'Salary', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'])
        .withMessage('Invalid category')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: errors.array()[0].msg });
        }

        const { text, amount, category, date } = req.body;

        const transaction = new Transaction({
            userId: req.user._id,
            text,
            amount,
            category,
            date: date || new Date()
        });

        await transaction.save();

        res.status(201).json({ success: true, data: { transaction } });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', async (req, res, next) => {
    try {
        const { text, amount, category, date } = req.body;

        let transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        // Update fields
        if (text) transaction.text = text;
        if (amount !== undefined) transaction.amount = amount;
        if (category) transaction.category = category;
        if (date) transaction.date = date;

        await transaction.save();

        res.json({ success: true, data: { transaction } });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', async (req, res, next) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
