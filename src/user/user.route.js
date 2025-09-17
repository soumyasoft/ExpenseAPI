import express, { json } from 'express';
import User from './user.model.js'; // Import the User model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import the JWT library
import { auth } from '../middleware/auth.js'; // Import the authentication middleware

const router = express.Router();

// Route for deleting a user
// DELETE /api/users/:userId
router.delete("/:userId", auth, async (req, res, next) => {
    const requestUserId = req.params.userId; // Get the user ID from the request parameters
    const tokenUserId = req.userId; // Get the user ID from the request object
    if (requestUserId !== tokenUserId) { // Check if the user IDs match
        const error = new Error("You are not authorized to access this resource"); // Create an error message
        error.statusCode = 403; // Set the status code to 403 Forbidden
        return next(error); // Call the next middleware with the error
    }

    try {
        const result = await User.findByIdAndDelete(requestUserId); // Delete the user from the database
        if (!result) { // If the user is not found, send an error response
            const error = new Error("User not found"); // Create an error message
            error.statusCode = 404; // Set the status code to 404 Not Found
            return next(error); // Call the next middleware with the error
        }
        res.status(200).json({ message: "User deleted" }); // Send a success response
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

// update user details
// PUT /api/users/:userId
router.put("/:userId", auth, async (req, res, next) => {
    const requestUserId = req.params.userId; // Get the user ID from the request parameters
    const tokenUserId = req.userId; // Get the user ID from the request object
    if (requestUserId !== tokenUserId) { // Check if the user IDs match
        const error = new Error("You are not authorized to access this resource"); // Create an error message  
        const statusCode = 403; // Set the status code to 403 Forbidden
        error.statusCode = statusCode; // Set the status code in the error object
        next(error); // Call the next middleware with the error
    }
    const { name, email, password } = req.body; // Destructure the request body to get user details
    if (!name || !email || !password) { // Check if all required fields are provided
        const error = new Error("Please provide all fields"); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        next(error); // Call the next middleware with the error
    }

    try {
        const salt = bcrypt.genSaltSync(10); // Generate a salt for hashing the password
        const hash = bcrypt.hashSync(password, salt); // Hash the password using the generated salt
        // Update the user in the database
        const result = await User.findByIdAndUpdate(
            { _id: requestUserId }, // Find the user by ID
            // Update the user details
            { name, email, password: hash }, // Update the user details in the database
            { new: true }, // Return the updated user document
            { runValidators: true }, // Validate the updated data against the model schema
            { overwrite: true }, // Overwrite the existing user document with the new data
            { upsert: true }, // Create a new user if it doesn't exist
        );
        if (!result) { // If the user is not found, send an error response
            const error = new Error("User not found"); // Create an error message
            error.statusCode = 404; // Set the status code to 404 Not Found
            return next(error); // Call the next middleware with the error
        }
        res.status(200).json({ message: "User updated", id: result._id }); // Send a success response with the user ID
        // res.status(200).json({ message: "User updated", id: result._id }); // Send a success response with the user ID
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});


// Getting user by ID
// GET /api/users/:userId
router.get("/:userId", auth, async (req, res, next) => {
    const requestUserId = req.params.userId; // Get the user ID from the request parameters
    const tokenUserId = req.userId; // Get the user ID from the request object
    if (requestUserId !== tokenUserId) { // Check if the user IDs match
        const error = new Error("You are not authorized to access this resource"); // Create an error message
        error.statusCode = 403; // Set the status code to 403 Forbidden
        return next(error); // Call the next middleware with the error       
    }

    const user = await User.findById({ _id: requestUserId }, { password: false, __v: false }); // Find the user by ID in the database
    res.status(200).json({ user }); // Send the user data in the response
});

// Route for user login
// POST /api/users/login
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body; // Destructure the request body to get email and password
    console.log(process.env.JWT_SECRET);
    if (!email || !password) { // Check if both email and password are provided
        const error = new Error("Please provide all fields"); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        next(error); // Call the next middleware with the error
    }

    try {
        const user = await User.findOne({ email }); // Find the user by email in the database

        if (!user) { // If user is not found, send an error response
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        const isMatch = bcrypt.compareSync(password, user.password); // Compare the provided password with the hashed password in the database

        if (!isMatch) { // If passwords do not match, send an error response
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            return next(error);
        }

        // Generate a JWT token (optional, not implemented in this snippet)

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h", // Set token expiration time
        });

        res.status(200).json({ message: "Login successful", id: user._id, name: user.name, email: user.email, token: token }); // Send a success response with the user ID
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

// Route for creating a new user
// POST /api/users

router.post("/", async (req, res, next) => {

    const { name, email, password } = req.body; // Destructure the request body to get user details

    if (!name || !email || !password) { // Check if all required fields are provided
        const error = new Error("Please provide all fields"); // Create an error message
        error.statusCode = 400; // Set the status code to 400 Bad Request
        next(error); // Call the next middleware with the error
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const result = await User.create({
            name,
            email,
            password: hash, // Store the hashed password in the database
        }); // Create a new user in the database 
        res.status(201).json({ messaage: "User created", id: result._id }); // Send a response with the user ID
    } catch (error) {
        next(error); // Call the next middleware with the error
    }
});

export default router;
