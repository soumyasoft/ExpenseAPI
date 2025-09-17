import express from 'express';
import Expense from './expense.model.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Route for adding a new expense entry
// POST /api/expenses
router.post('/', auth, async (req, res, next) => {
    const { expenseName, amount, description, expenseDate } = req.body; // Destructure the request body to get expense details 
    if (!expenseName || !amount || !description) { // Check if all required fields are provided
        const error = new Error('Please provide all fields'); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        return next(error); // Call the next middleware with the error
    }
    if (expenseDate && isNaN(Date.parse(expenseDate))) { // Validate the date format if provided
        const error = new Error('Invalid date format'); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        return next(error); // Call the next middleware with the error
    }
    try {
        const expense = new Expense({ // Create a new expense entry
            expenseName,
            amount,
            description,
            expenseDate: expenseDate ? expenseDate : new Date(), // Use provided date or current date
            userId: req.userId // Attach the user ID from the authenticated request
        });
        const result = await expense.save(); // Save the expense entry to the database
        res.status(201).json(result); // Send a success response with the created expense entry
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

router.get('/', auth, async (req, res, next) => {
    const { page = 1, limit = 10, startDate, endDate } = req.query; // Destructure query parameters for pagination and date filtering
    const filter = { userId: req.userId }; // Initialize filter with user ID to fetch only user's entries   
    if (startDate) { // If startDate is provided, add it to the filter
        if (isNaN(Date.parse(startDate))) { // Validate the date format
            const error = new Error('Invalid startDate format'); // Create an error message
            error.statusCode = 400; // Set the status code to 400 Bad Request
            return next(error); // Call the next middleware with the error
        }
        filter.expenseDate = { ...filter.expenseDate, $gte: new Date(startDate) }; // Add start date filter
    }
    if (endDate) { // If endDate is provided, add it to the filter
        if (isNaN(Date.parse(endDate))) { // Validate the date format
            const error = new Error('Invalid endDate format'); // Create an error message
            error.statusCode = 400; // Set the status code to 400 Bad Request
            return next(error); // Call the next middleware with the error
        }
        filter.expenseDate = { ...filter.expenseDate, $lte: new Date(endDate) }; // Add end date filter
    }
    try {
        const expenses = await Expense.find(filter).sort({ expenseDate: -1 }); // Find expenses matching the filter          
        const total = await Expense.countDocuments(filter) // Get the total count of documents matching the filter
        // Calculate total expense amount
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.json({
            total,
            totalAmount,
            // page: parseInt(page),
            // limit: parseInt(limit),
            expenses
        }); // Send the paginated response with expenses
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

export default router; // Export the router for use in other parts of the application