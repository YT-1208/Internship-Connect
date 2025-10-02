const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { protect, employer } = require('../middleware/authMiddleware');

// Protected routes
router.put('/close/:internshipId', protect, employer, internshipController.closeInternship);
router.get('/:internshipId/applicants', protect, employer, internshipController.getApplicantsForInternship);
router.get('/:internshipId', protect, employer, internshipController.getInternshipById);
router.put('/:internshipId', protect, employer, internshipController.updateInternship);

module.exports = router;
