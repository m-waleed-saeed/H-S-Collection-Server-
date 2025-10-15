const express = require('express');
const router = express.Router();
const { getAllUsers, getOneUser, deleteUser } = require('../controllers/user');
const { verifyUser, verifyAdmin } = require('../middleware/auth');

// Get All Users (Admin only)
router.get('/', verifyUser, verifyAdmin, getAllUsers);

// Get One User (Admin or self)
router.get('/find/:id', verifyUser, getOneUser);

// Delete User (Admin only)
router.delete('/:id', verifyUser, verifyAdmin, deleteUser);

module.exports = router;
