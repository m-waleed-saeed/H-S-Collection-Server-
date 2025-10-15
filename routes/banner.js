const express = require('express');
const router = express.Router();
const { createBanner, deleteBanner, getAllBanner, getRandomBanner } = require('../controllers/banner');
const { verifyUser, verifyAdmin } = require('../middleware/auth');

// Create Banner (Admin only)
router.post('/', verifyUser, verifyAdmin, createBanner);

// Get All Banner (Admin only)
router.get('/', verifyUser, verifyAdmin, getAllBanner);

// Delete Banner (Admin only)
router.delete('/:id', verifyUser, verifyAdmin, deleteBanner);

// Get Random Banner (Public)
router.get('/random', getRandomBanner);

module.exports = router;