import express from "express";
import Milk from "./milk.model.js";
import { auth } from "../middleware/auth.js"; // Import the authentication middleware
const router = express.Router();
// Route for adding a new milk entry
// POST /api/milk   
router.post("/", auth, async (req, res, next) => {
    const { quantity, pricePerLiter, milkInDate } = req.body; // Destructure the request body to get milk details

    if (!quantity) { // Check if quantity is provided
        const error = new Error("Please provide all fields"); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        return next(error); // Call the next middleware with the error
    }
    if (milkInDate && isNaN(Date.parse(milkInDate))) { // Validate the date format if provided
        const error = new Error("Invalid date format"); // Create an error message  
        error.statusCode = 400; // Set the status code to 400 Bad Request
        return next(error); // Call the next middleware with the error
    }
    const price = pricePerLiter || parseFloat(process.env.MILK_PRICE_PER_LITER) || 45; // Use provided price or default from environment variable or 45
    const totalPrice = (quantity * price) / 1000; // Calculate the total price

    try {
        const milk = new Milk({ // Create a new milk entry
            quantity,
            pricePerLiter: price,
            milkInDate: milkInDate ? milkInDate : new Date(), // Use provided date or current date
            totalPrice,
            userId: req.userId // Attach the user ID from the authenticated request
        });
        const result = await milk.save(); // Save the milk entry to the database
        res.status(201).json(result); // Send a success response with the created milk entry
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

// Route for fetchin repog all milk entries with date filter
// GET /api/milk?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get("/", auth, async (req, res, next) => {
    const { page = 1, limit = 3, startDate, endDate } = req.query; // Destructure query parameters for date filtering
    const filter = { userId: req.userId }; // Initialize filter with user ID to fetch only user's entries

    if (startDate) { // If startDate is provided, add it to the filter
        if (isNaN(Date.parse(startDate))) { // Validate the date format
            const error = new Error("Invalid startDate format"); // Create an error message
            error.statusCode = 400; // Set the status code to 400 Bad Request
            return next(error); // Call the next middleware with the error
        }
        filter.milkInDate = { ...filter.milkInDate, $gte: new Date(startDate) }; // Add start date filter
    }
    if (endDate) { // If endDate is provided, add it to the filter
        if (isNaN(Date.parse(endDate))) { // Validate the date format
            const error = new Error("Invalid endDate format"); // Create an error message
            error.statusCode = 400; // Set the status code to 400 Bad Request
            return next(error); // Call the next middleware with the error
        }
        filter.milkInDate = { ...filter.milkInDate, $lte: new Date(endDate) }; // Add end date filter
    }

    // if (page > 0) {
    //     filter.page = page;
    // }
    // console.log(filter);
    try {
        const milkEntries = await Milk.find(filter); // Fetch milk entries from the database with applied filters and sort by date descending
        // const options = {
        //     filter: filter,
        //     // page: parseInt(page),
        //     // limit: parseInt(limit),
        // };
        // // console.log(options);
        // // const milkEntries = await Milk.paginate({}, options);
        // const milkEntries = await Milk.find(options);
        // const newData= milkEntries.docs;
        const sum = milkEntries.reduce((acc, entry) => acc + entry.totalPrice, 0);
        res.json({ totalPriceSum: sum,totalDays: milkEntries.length, entries: milkEntries });
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

export default router; // Export the router for use in other parts of the application