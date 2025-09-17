import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const stockSchema = new mongoose.Schema({
    stockName: { // Name of the stock item
        type: String,
        required: true
    },
    quantity: { // Quantity of the stock item
        type: Number,
        required: true
    },
    pricePerUnitBuy: { // Price per unit of the stock item 
        type: Number,
        required: true
    },
    pricePerUnitSell: { // Selling price per unit of the stock item
        type: Number,
        default: 0 // Default to 0 if not sold yet
    },
    totalPrice: { // Total price for the quantity of stock item
        type: Number,
        required: true
    },
    stockInDate: { // Date of the stock entry
        type: Date,
        required: true,
        default: Date.now // Default to current date
    },
    stockSaleDate: { // Date of the stock sale
        type: Date,
        default: null // Default to null if not sold yet
    },
    stckProfit: { // Profit from the stock sale
        type: Number,
        default: 0 // Default to 0 if not sold yet
    },
    userId: { // Reference to the user who owns this stock entry
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});
stockSchema.plugin(mongoosePaginate); // Add pagination plugin to the schema
const Stock = mongoose.model("Stock", stockSchema); // Create a model from the schema
export default Stock; // Export the model for use in other parts of the application