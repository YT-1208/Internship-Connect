
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { protect, employer, admin } = require('../middleware/authMiddleware');

// Public route
router.post('/register', employerController.registerEmployer);

// Protected routes
router.get('/internships', protect, employer, employerController.getEmployerInternships);
router.get('/:id', protect, employer, employerController.getEmployerDetails);
router.put('/:id', protect, employer, employerController.upload.single('profileImage'), employerController.updateEmployerDetails);

router.get('/profile-completion/:userId', protect, employer, employerController.checkProfileCompletion);

// Dashboard routes
router.get('/dashboard/stats', protect, employer, employerController.getDashboardStats);
router.get('/dashboard/recent-applications', protect, employer, employerController.getRecentApplications);
router.get('/dashboard/recent-ratings', protect, employer, employerController.getRecentRatings);

// Admin route to verify an employer
router.put('/verify/:id', protect, admin, employerController.verifyEmployer);

module.exports = router;
