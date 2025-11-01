require("dotenv").config()
const express = require("express");
const cors = require("cors");
const morgan = require("morgan")
const bodyParser = require("body-parser")
const { connectDB } = require("./config/db");

const auth = require("./routes/auth");
const user = require("./routes/user");
const banner = require("./routes/banner");
const product = require("./routes/product");
const order = require("./routes/order");
const contact = require("./routes/contact");
const category = require("./routes/category");
const upload = require("./routes/cloudinary");
const public = require("./routes/public")
const subscriber = require("./routes/subscriber");

const { PORT = 8000 } = process.env

connectDB();

const app = express()

app.use(cors({
  origin: ["https://www.handscollection.com", "https://handscollection.com", "http://localhost:5173"],
  methods: ["GET", "POST", 'PUT', "PATCH", "OPTIONS", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization',],
  credentials: true,
}))

app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json())

app.use("/auth", auth);
app.use("/users", user);
app.use("/banners", banner);
app.use("/categories", category);
app.use("/products", product);
app.use("/upload", upload);
app.use("/orders", order);
app.use("/contacts", contact);
app.use("/public", public)
app.use("/subscribers", subscriber);

app.get("/", async (req, res) => {
  res.send("Server is Running")
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});