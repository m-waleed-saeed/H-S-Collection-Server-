// middlewares/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const { JWT_SECRET } = process.env;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    console.log('first', authHeader)
    const token = authHeader?.split(" ")[1]
    if (!token) return res.status(401).json({ message: "Access token missing" });

    jwt.verify(token, JWT_SECRET, async (error, result) => {
        if (!error) {
          console.log('result', result)
            req.id = result.id
            next()
        } else {
            console.error(error)
            return res.status(401).json({ message: "Unauthorized" })
        }
    })
}

module.exports = { verifyToken };
