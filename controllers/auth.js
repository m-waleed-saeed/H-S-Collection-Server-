const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists', success: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword });

        const { password: _, ...userWithoutPassword } = newUser._doc;

        return res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found', success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password', success: false });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

        const { password: _, ...userWithoutPassword } = user._doc;

        return res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message });
    }
};


module.exports = { register, login };
