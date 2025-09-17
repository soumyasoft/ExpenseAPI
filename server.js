import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import userRouter from "./src/user/user.route.js"; // Import user router
import milkRouter from "./src/milk/milk.route.js"; // Import milk router
import expenseRouter from "./src/expense/expense.route.js"; // Import expense router
import helmet from "helmet";
import 'dotenv/config'

const app = express();

// Database connection
try {
    connectDB(); // Connect to the database
    console.log("Connected to MongoDB");
} catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if the connection fails
}

// Global Middleware
app.use(express.json()); // Middleware to parse JSON bodies
app.use(helmet()); // Use Helmet for security headers
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(cors()); // Enable CORS for all routes
app.use(userRouter); // Use the user router for handling user-related routes
app.use("/api/milk", milkRouter); // Route for milk entries
app.use("/api/expenses", expenseRouter); // Route for expense entries

// Custom middleware to log request details
const requestLogger = ((req, res, next) => {
    console.log(`${req.method} ${req.url} ${new Date().toISOString()}`);
    next(); // Call the next middleware or route handler
});

app.use(requestLogger); // Use the request logger middleware

app.use("/api/users", userRouter); // Route for creating a new user



app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Set the status code from the error or default to 500
    res.status(statusCode).json({ message: err.message}); // Send a generic error response
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});