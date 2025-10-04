const User = require('../models/user')

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(404).json({ message: "Users not found", success: false });
        }
        res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message })
    }
}

// Get One User
const getOneUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        res.status(201).json(user)
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', success: false, error: error.message })
    }
}

// Delete User
const deleteUser = async (req, res) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(201).json('User was deleted successfully', deletedUser)
}

module.exports = { getAllUsers, getOneUser, deleteUser }