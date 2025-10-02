const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordUpdateConfirmationEmail } = require('../utils/emailService');

exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  console.log('Login attempt:', { username, role });

  try {
    const [result] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    const user = result[0];
    console.log('User from DB:', user);

    if (user.role !== role) {
      return res.status(403).json({ msg: `You are registered as a ${user.role}. Please log in with the ${user.role} role.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const tokenPayload = { id: user.user_id, role: user.role };

    if (user.role === 'system admin') {
      const [adminResult] = await db.query('SELECT university_id FROM system_admins WHERE user_id = ?', [user.user_id]);
      if (adminResult.length > 0) {
        tokenPayload.university_id = adminResult[0].university_id;
      }
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential || !role) {
    return res.status(400).json({ msg: 'Missing credential or role' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload['email'];

    const [result] = await db.query('SELECT * FROM users WHERE username = ?', [email]);

    if (result.length === 0) {
        // User not found, needs to register
        return res.json({ needsRegistration: true, email: email, googleCredential: credential });
    }

    const user = result[0];
    if (user.role !== role) {
      return res.status(403).json({ msg: `You are registered as a ${user.role}. Please log in with the ${user.role} role.` });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user, needsRegistration: false });
  } catch (error) {
    console.error('Google login error details:', error);
    res.status(500).json({ msg: 'Invalid Google credential or server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [results] = await db.query('SELECT user_id, username FROM users WHERE username = ?', [email]);
    if (results.length === 0) {
      return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link.' });
    }

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.user_id, token, expiresAt]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    sendPasswordResetEmail(user.username, resetLink);

    res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link.' });
  } catch (err) {
    console.error('Database error (forgotPassword):', err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const [results] = await db.query('SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?', [token]);
    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const resetToken = results[0];
    if (new Date() > new Date(resetToken.expires_at)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, resetToken.user_id]);
    await db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

    sendPasswordUpdateConfirmationEmail(resetToken.user_id);
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Database error (resetPassword):', err);
    res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
};