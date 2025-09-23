
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

// POST /api/employers/register
router.post('/register', employerController.registerEmployer);

module.exports = router;
