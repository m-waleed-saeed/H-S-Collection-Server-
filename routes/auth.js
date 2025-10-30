const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = process.env;

// Register
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        if (!firstName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const saltRounds = parseInt(BCRYPT_SALT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        const userToReturn = await User.findById(newUser._id).select('-password');
        return res.status(201).json({ success: true, message: 'User registered successfully', user: userToReturn, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        const userToReturn = await User.findById(user._id).select('-password');

        return res.status(200).json({ success: true, message: 'Login successful', token, user: userToReturn });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message });
    }
});

module.exports = router;
