// const express = require("express");
// const dotenv = require("dotenv");
// dotenv.config({ quiet: true });
// const cors = require("cors");
// const colors = require("colors");
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/auth");
// const userRoutes = require("./routes/user");
// const bannerRoutes = require("./routes/banner");
// const productRoutes = require("./routes/product");
// const orderRoutes = require("./routes/order");
// const contactRoutes = require("./routes/contact");
// const categoryRoutes = require("./routes/category");
// const uploadRoute = require("./routes/cloudinary");
// const subscriberRoutes = require("./routes/subscriber");
// const serverless = require("serverless-http");

// const app = express();


// app.use(
//   cors({
//     origin: [
//       "https://handscollection.com",
//       "https://www.handscollection.com",
//       "http://localhost:5173",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// require("./models/category");

// // ✅ All routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/banners", bannerRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/upload", uploadRoute);
// app.use("/api/orders", orderRoutes);
// app.use("/api/contacts", contactRoutes);
// app.use("/api/subscribers", subscriberRoutes);

// connectDB();

// module.exports = app;
// module.exports.handler = serverless(app);


const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });
const cors = require("cors");
const colors = require("colors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const bannerRoutes = require("./routes/banner");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const contactRoutes = require("./routes/contact");
const categoryRoutes = require("./routes/category");
const uploadRoute = require("./routes/cloudinary");
const subscriberRoutes = require("./routes/subscriber");
const serverless = require("serverless-http");
const mongoose = require("mongoose");

const app = express();

// ✅ CORS setup
app.use(
  cors({
    origin: [
      "https://handscollection.com",
      "https://www.handscollection.com",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
require("./models/category");

// ✅ Connect MongoDB
connectDB();

// ✅ Test MongoDB Connection API
app.get("/api/test-db", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];

    if (state === 1) {
      res.status(200).json({
        status: states[state],
        message: "✅ MongoDB is connected successfully!",
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
      });
    } else {
      res.status(500).json({
        status: states[state],
        message: "❌ MongoDB is not connected properly.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error checking MongoDB connection.",
      error: error.message,
    });
  }
});

// ✅ All routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/subscribers", subscriberRoutes);

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`.bgCyan);
});

module.exports = app;
module.exports.handler = serverless(app);
