const express = require('express')
const router = express.Router()

const { getAllUsers, getOneUser, deleteUser } = require('../controllers/user')

//Get All Users
router.get('/',getAllUsers)

// Get One User
router.get('/find/:id',getOneUser)

// Delete User
router.delete('/:id',deleteUser)

module.exports = router;