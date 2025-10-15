const User = require('../models/user')

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select("-password")
            .skip(skip)
            .limit(limit);
        const total = await User.countDocuments();

        res.status(200).json({ success: true, data: users, total, page, limit, });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong", error: error.message, });
    }
};

// Get One User
const getOneUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(201).json(user)
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message })
    }
}

// Delete User
const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, message: 'User deleted', userId: deleted._id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAllUsers, getOneUser, deleteUser }