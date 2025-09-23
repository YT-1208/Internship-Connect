const express = require('express');
const router = express.Router();
const systemAdminController = require('../controllers/systemAdminController');

// 1. Initiate subscription (called from Subscription.js)
router.post('/initiate-subscription', systemAdminController.initiateSubscription);

// 2. Confirm payment (called from AdminPayment.js)
router.post('/confirm-payment', systemAdminController.confirmPayment);

// 3. Register admin after payment (new route, called from AdminPayment.js)
router.post('/register', systemAdminController.registerAdmin);

router.get('/internships', systemAdminController.getAllInternships);

// Get admin details
router.get('/:id', systemAdminController.getAdminDetails);

// Update admin details
router.put('/:id', systemAdminController.upload.single('profileImage'), systemAdminController.updateAdminDetails);

// Get University Details by ID
router.get('/university/:universityId', systemAdminController.getUniversityDetails);

// Get Students by University ID
router.get('/students/:universityId', systemAdminController.getStudentsByUniversityId);

// Verify Student Account
router.put('/student/verify/:studentId', systemAdminController.verifyStudent);

// Remove Student Account
router.delete('/student/remove/:studentId', systemAdminController.removeStudent);

// Email notification routes
router.get('/student/verify/notify/:studentId', systemAdminController.sendVerificationNotification);
router.get('/student/remove/notify/:studentId', systemAdminController.sendRemovalNotification);

module.exports = router;