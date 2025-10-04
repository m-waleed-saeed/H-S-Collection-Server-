const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const colors = require('colors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const contactRoutes = require("./routes/contact");
const categoryRoutes = require("./routes/category");

const app = express();

app.use(express.json());
app.use(cors());

// Model to avoid "Schema hasn't been registered for model" error
require("./models/category");

//All Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/contacts", contactRoutes);




const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan);
});

connectDB();