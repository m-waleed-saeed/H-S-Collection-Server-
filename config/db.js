const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const colors = require('colors');

const { MONGODB_USER, MONGODB_PASSWORD } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.3kttw4m.mongodb.net/`)
        console.log('MongoDB connected successfully'.bgGreen);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`.bgRed);
    }
}

module.exports = connectDB;