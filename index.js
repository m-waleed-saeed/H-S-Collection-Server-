const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const cors = require('cors');
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
const subscriberRoutes = require('./routes/subscriber');


const app = express();

app.use(cors({ origin: ["https://handscollection.com", "https://www.handscollection.com", 'http://localhost:5173'], methods: ["GET", "POST", "PUT", "DELETE"], credentials: true, }));

app.use(express.json());

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


// ✅ Connect DB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on PORT ${PORT}`.bgCyan);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
};

startServer();