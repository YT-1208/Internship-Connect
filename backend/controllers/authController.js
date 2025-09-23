const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordUpdateConfirmationEmail } = require('../utils/emailService');

exports.login = (req, res) => {
  const { username, password, role } = req.body; // Get role from request
  console.log('Login attempt:', { username, password, role });

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ msg: "User not found" });

    const user = result[0];
    console.log('User from DB:', user);
    
    // Validate role matches stored role
    if (user.role !== role) {
      return res.status(403).json({ msg: "Role mismatch. Use the correct role." });
    }

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user.user_id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ token, user });
  });
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

    db.query('SELECT * FROM users WHERE username = ?', [email], (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        // User not found, needs to register
        return res.json({ needsRegistration: true, email: email });
      } else {
        // User found
        const user = result[0];
        if (user.role !== role) {
          return res.status(403).json({ msg: 'Role mismatch. Please select the correct role.' });
        }

        const token = jwt.sign(
          { id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );

        res.json({ token, user, needsRegistration: false });
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Invalid Google credential' });
  }
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  db.query('SELECT user_id, username FROM users WHERE username = ?', [email], (err, results) => {
    if (err) {
      console.error('Database error (forgotPassword):', err);
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
    if (results.length === 0) {
      // For security, always return a success message even if user not found
      return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link.' });
    }

    const user = results[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour

    db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.user_id, token, expiresAt],
      (err) => {
        if (err) {
          console.error('Database error (inserting token):', err);
          return res.status(500).json({ success: false, message: 'Failed to generate reset token.' });
        }

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        sendPasswordResetEmail(user.username, resetLink);

        res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link.' });
      }
    );
  });
};

exports.resetPassword = (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  db.query(
    'SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?',
    [token],
    (err, results) => {
      if (err) {
        console.error('Database error (resetPassword - token lookup):', err);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
      }
      if (results.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
      }

      const resetToken = results[0];
      if (new Date() > new Date(resetToken.expires_at)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Bcrypt error (hashing password):', err);
          return res.status(500).json({ success: false, message: 'Failed to hash password.' });
        }

        db.query(
          'UPDATE users SET password = ? WHERE user_id = ?',
          [hashedPassword, resetToken.user_id],
          (err) => {
            if (err) {
              console.error('Database error (updating password):', err);
              return res.status(500).json({ success: false, message: 'Failed to update password.' });
            }

            db.query(
              'DELETE FROM password_reset_tokens WHERE token = ?',
              [token],
              (err) => {
                if (err) {
                  console.error('Database error (deleting token):', err);
                  // Log error but don't prevent success response
                }
                sendPasswordUpdateConfirmationEmail(resetToken.user_id);
                res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
              }
            );
          }
        );
      });
    }
  );
};