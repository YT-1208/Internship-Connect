const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sendRegistrationEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  const { fullName, email, password, mobileNumber, universityId, matricNo, program, fromGoogle, googleCredential } = req.body;

  if (fromGoogle) {
    // Google SSO Registration
    try {
      const ticket = await client.verifyIdToken({
        idToken: googleCredential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email: googleEmail, name: googleName } = payload;

      const [existing] = await db.promise().query('SELECT * FROM users WHERE username=?', [googleEmail]);
      if (existing.length > 0) {
        return res.status(409).json({ msg: 'Email already exists' });
      }

      const [subscription] = await db.promise().query('SELECT * FROM subscriptions WHERE university_id = ? AND status = ?', [universityId, 'paid']);
      if (subscription.length === 0) {
        return res.status(400).json({ msg: 'Registration failed. The university is not subscribed to Internship-Connect.' });
      }

      const userId = uuidv4();
      const hash = await bcrypt.hash(password, 10);
      await db.promise().query('INSERT INTO users (user_id, username, password, role, is_complete) VALUES (?, ?, ?, ?, 1)', [userId, googleEmail, hash, 'student']);

      const studentId = uuidv4();
      await db.promise().query(
        `INSERT INTO students (student_id, user_id, university_id, matricNo, fullName, program, phoneNumber)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, userId, universityId, matricNo, googleName, program, mobileNumber]
      );

      // Send registration email
      sendRegistrationEmail(googleEmail, googleName);

      res.status(201).json({ msg: 'Registration successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err });
    }
  } else {
    // Manual Registration
    if (!fullName || !email || !password || !mobileNumber || !universityId || !matricNo || !program) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
      const [existing] = await db.promise().query('SELECT * FROM users WHERE username=?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ msg: 'Email already exists' });
      }

      const [subscription] = await db.promise().query('SELECT * FROM subscriptions WHERE university_id = ? AND status = ?', [universityId, 'paid']);
      if (subscription.length === 0) {
        return res.status(400).json({ msg: 'Registration failed. The university is not subscribed to Internship-Connect.' });
      }

      const userId = uuidv4();
      const hash = await bcrypt.hash(password, 10);
      await db.promise().query('INSERT INTO users (user_id, username, password, role, is_complete) VALUES (?, ?, ?, ?, 1)', [userId, email, hash, 'student']);

      const studentId = uuidv4();
      await db.promise().query(
        `INSERT INTO students (student_id, user_id, university_id, matricNo, fullName, program, phoneNumber)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [studentId, userId, universityId, matricNo, fullName, program, mobileNumber]
      );

      // Send registration email
      sendRegistrationEmail(email, fullName);

      res.status(201).json({ msg: 'Registration successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err });
    }
  }
};

exports.getStudentDetails = (req, res) => {
  const studentId = req.params.studentId;
  console.log('studentId:', studentId);

  const query = `
    SELECT
      s.fullName,
      s.matricNo,
      u.username as email,
      s.program,
      s.phoneNumber as contactNumber
    FROM students s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.student_id = ?;
  `;
  console.log('query:', query);

  db.query(query, [studentId], (err, results) => {
    console.log('results:', results);
    if (err) {
      console.error('Database error (fetching student details):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student details. Please try again later.'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: results[0]
    });
  });
};
