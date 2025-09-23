const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/register', studentController.register);

router.get('/:studentId', studentController.getStudentDetails);

module.exports = router;
