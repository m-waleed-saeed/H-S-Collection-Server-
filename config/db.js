const mongoose = require("mongoose")

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_NAME } = process.env

const connectDB = () => {
    mongoose.connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.3kttw4m.mongodb.net/`, { dbName: MONGODB_NAME })
        .then(() => {
            console.log("MongoDB connected")
        })
        .catch(error => {
            console.error("MongoDB error", error)
        })
}

module.exports = { connectDB }