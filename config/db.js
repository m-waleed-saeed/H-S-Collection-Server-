const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD } = process.env;

const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.3kttw4m.mongodb.net/?retryWrites=true&w=majority`;

let isConnected = false; // to track connection state across serverless invocations

const connectDB = async () => {
  if (isConnected) {
    // ✅ Already connected
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;
