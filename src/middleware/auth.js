import jwt from "jsonwebtoken"; // Import the jsonwebtoken library

export const auth = (req, res, next) => {
    if (req.headers.authorization?.startsWith("Bearer")) { // Check if the Authorization header is present and starts with "Bearer"
        const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header

        try {
            const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret key
            req.userId = jwtDecoded.id; // Attach the token to the request object for later use
            next(); // Call the next middleware or route handler    
            return; // Exit the function after calling next()
        } catch (error) {
            next(error); // If token verification fails, call the next middleware with the error
            return; // Exit the function after calling next()
        }
    }
    const error = new Error("Not Authenticated"); // Create an error message for missing token
    error.statusCode = 401; // Set the status code to 401 Unauthorized
    next(error); // Call the next middleware with the error
}