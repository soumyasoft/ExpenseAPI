import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const milkSchema = new mongoose.Schema({
    quantity: { // Quantity of milk in liters
        type: Number,
        required: true
    },
    pricePerLiter: { // Price per liter of milk
        type: Number,
        required: true,
        default: parseFloat(process.env.MILK_PRICE_PER_LITER) || 45 // Default price per liter from environment variable or 45
    },
    totalPrice: { // Total price for the quantity of milk
        type: Number,
        required: true
    },
    milkInDate: { // Date of the milk entry
        type: Date,
        required: true,
        unique: true,
        default: Date.now // Default to current date
    },
    userId: { // Reference to the user who owns this milk entry
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});
milkSchema.plugin(mongoosePaginate); // Add pagination plugin to the schema
const Milk = mongoose.model("Milk", milkSchema); // Create a model from the schema
export default Milk; // Export the model for use in other parts of the application
