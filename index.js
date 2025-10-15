const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const bodyParser = require('body-parser');
const colors = require('colors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bannerRoutes = require('./routes/banner')
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const contactRoutes = require("./routes/contact");
const categoryRoutes = require("./routes/category");
const uploadRoute = require("./routes/cloudinary");
const subscriberRoutes = require('./routes/subscriber')


const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["https://handscollection.com", "https://www.handscollection.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.options("*", cors());

// Model to avoid "Schema hasn't been registered for model" error
require("./models/category");

//All Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/orders', orderRoutes);

app.use("/api/contacts", contactRoutes);
app.use("/api/subscribers", subscriberRoutes);


connectDB();

module.exports = app;