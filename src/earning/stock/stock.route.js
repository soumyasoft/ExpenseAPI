import express from 'express';
import Stock from './stock.model.js';
import { auth } from '../../../middleware/auth.js';

const router = express.Router();

// Route for adding a new stock entry
router.post('/', auth, async (req, res, next) => {
    const { 
        stockName, 
        buyPrice, 
        sellPrice,
        quantity,
        buyDate,
        sellDate,
        profitLoss,
    } = req.body;

    // Validate required fields
    if (!stockName || !buyPrice || !quantity || !buyDate) {
        const error = new Error('Please provide required fields: stockName, buyPrice, quantity, buyDate');
        error.statusCode = 400;
        return next(error);
    }

    // Validate date formats
    if (buyDate && isNaN(Date.parse(buyDate))) {
        const error = new Error('Invalid buyDate format');
        error.statusCode = 400;
        return next(error);
    }

    if (sellDate && isNaN(Date.parse(sellDate))) {
        const error = new Error('Invalid sellDate format');
        error.statusCode = 400;
        return next(error);
    }

    profitLoss = sellPrice ? (sellPrice - buyPrice) * quantity : 0;

    try {
        const stock = new Stock({
            stockName,
            buyPrice,
            sellPrice,
            quantity,
            buyDate: new Date(buyDate),
            sellDate: sellDate ? new Date(sellDate) : null,
            profitLoss,
            userId: req.userId
        });

        const result = await stock.save();
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Route for getting all stock entries
router.get('/', auth, async (req, res, next) => {
    try {
        const stocks = await Stock.find({ userId: req.userId })
            .sort({ buyDate: -1 });
        
        const total = await Stock.countDocuments({ userId: req.userId });
        
        // Calculate total investment
        const totalInvestment = stocks.reduce((sum, stock) => 
            sum + (stock.buyPrice * stock.quantity), 0);

        // Calculate total profit/loss
        const totalProfitLoss = stocks.reduce((sum, stock) => 
            sum + (stock.profitLoss || 0), 0);

        res.json({
            total,
            totalInvestment,
            totalProfitLoss,
            stocks
        });
    } catch (error) {
        next(error);
    }
});

// Route for updating a stock entry (e.g., adding sell details)
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const stock = await Stock.findOne({ 
            _id: req.params.id, 
            userId: req.userId 
        });

        if (!stock) {
            const error = new Error('Stock not found');
            error.statusCode = 404;
            return next(error);
        }

        // Update allowed fields
        const updates = ['sellPrice', 'sellDate', 'profitLoss'];
        updates.forEach(update => {
            if (req.body[update] !== undefined) {
                stock[update] = update === 'sellDate' 
                    ? new Date(req.body[update]) 
                    : req.body[update];
            }
        });

        const result = await stock.save();
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Route for deleting a stock entry
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const result = await Stock.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.userId 
        });

        if (!result) {
            const error = new Error('Stock not found');
            error.statusCode = 404;
            return next(error);
        }

        res.json({ message: 'Stock entry deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;