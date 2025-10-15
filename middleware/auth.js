// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();
const { JWT_SECRET } = process.env;

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No token' });
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }
  next();
};

module.exports = { verifyUser, verifyAdmin };
