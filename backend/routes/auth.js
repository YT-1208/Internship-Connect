const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const authController = require('../controllers/authController');
require('dotenv').config();
const crypto = require('crypto');
const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', authController.googleLogin);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;