import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avtar: {
        type: String,
        required: false
    },
},
    {
        timestamps: true // Automatically add createdAt and updatedAt fields
    });

const User = mongoose.model('User', userSchema); // Create a model from the schema
export default User; // Export the model for use in other parts of the application