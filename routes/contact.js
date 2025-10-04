const express = require("express");
const { createContact, getContacts,deleteContact } = require("../controllers/contact");
const router = express.Router();

router.post("/", createContact);  

router.get("/", getContacts);      

router.delete("/:id", deleteContact);

module.exports = router;
