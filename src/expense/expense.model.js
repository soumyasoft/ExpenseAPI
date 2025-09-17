import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    expenseName: { // Name of the expense
        type: String,
        required: true
    },
    amount: { // Amount of the expense
        type: Number,
        required: true
    },
    description: { // Description of the expense
        type: String,
        required: true
    },
    expenseDate: { // Date of the expense
        type: Date,
        required: true,
        default: Date.now // Default to current date
    },
    userId: { // Reference to the user who owns this expense entry
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});
const Expense = mongoose.model("Expense", expenseSchema); // Create a model from the schema
export default Expense; // Export the model for use in other parts of the application