const express = require('express');
const router = express.Router();
const systemAdminController = require('../controllers/systemAdminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/initiate-subscription', systemAdminController.initiateSubscription);
router.post('/confirm-payment', systemAdminController.confirmPayment);
router.post('/register', systemAdminController.registerAdmin);

// Protected admin routes
router.get('/internships/:id', protect, admin, systemAdminController.getInternshipById);
router.get('/internships', protect, admin, systemAdminController.getAllInternships);

router.get('/employers', protect, admin, systemAdminController.getAllEmployers);
router.put('/employer/verify/:employerId', protect, admin, systemAdminController.verifyEmployer);
router.put('/employer/block/:employerId', protect, admin, systemAdminController.blockEmployer);
router.put('/employer/unblock/:employerId', protect, admin, systemAdminController.unblockEmployer);
router.get('/employer/:employerId', protect, admin, systemAdminController.getEmployerById);

router.get('/university/:universityId', protect, admin, systemAdminController.getUniversityDetails);
router.get('/students/:universityId', protect, admin, systemAdminController.getStudentsByUniversityId);
router.put('/student/verify/:studentId', protect, admin, systemAdminController.verifyStudent);
router.delete('/student/remove/:studentId', protect, admin, systemAdminController.removeStudent);
router.get('/student/verify/notify/:studentId', protect, admin, systemAdminController.sendVerificationNotification);
router.get('/student/remove/notify/:studentId', protect, admin, systemAdminController.sendRemovalNotification);

router.get('/subscription', protect, admin, systemAdminController.getSubscriptionDetails);

// General routes with single ID parameter last
router.get('/:id', protect, admin, systemAdminController.getAdminDetails);
router.put('/:id', protect, admin, systemAdminController.upload.single('profileImage'), systemAdminController.updateAdminDetails);

module.exports = router;