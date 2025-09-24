const express = require('express');
const router = express.Router();
const systemAdminController = require('../controllers/systemAdminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/initiate-subscription', systemAdminController.initiateSubscription);
router.post('/confirm-payment', systemAdminController.confirmPayment);
router.post('/register', systemAdminController.registerAdmin);

// Protected admin routes
router.get('/internships', protect, admin, systemAdminController.getAllInternships);
router.get('/:id', protect, admin, systemAdminController.getAdminDetails);
router.put('/:id', protect, admin, systemAdminController.upload.single('profileImage'), systemAdminController.updateAdminDetails);
router.get('/university/:universityId', protect, admin, systemAdminController.getUniversityDetails);
router.get('/students/:universityId', protect, admin, systemAdminController.getStudentsByUniversityId);
router.put('/student/verify/:studentId', protect, admin, systemAdminController.verifyStudent);
router.delete('/student/remove/:studentId', protect, admin, systemAdminController.removeStudent);
router.get('/student/verify/notify/:studentId', protect, admin, systemAdminController.sendVerificationNotification);
router.get('/student/remove/notify/:studentId', protect, admin, systemAdminController.sendRemovalNotification);

module.exports = router;