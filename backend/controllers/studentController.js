const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sendRegistrationEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  const { fullName, email, password, mobileNumber, universityId, matricNo, program, fromGoogle, googleCredential } = req.body;

  try {
    let emailToRegister, nameToRegister;

    if (fromGoogle) {
      const ticket = await client.verifyIdToken({ idToken: googleCredential, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      emailToRegister = payload.email;
      nameToRegister = payload.name;
    } else {
      emailToRegister = email;
      nameToRegister = fullName;
    }

    if (!nameToRegister || !emailToRegister || !password || !mobileNumber || !universityId || !matricNo || !program) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const [existing] = await db.query('SELECT * FROM users WHERE username=?', [emailToRegister]);
    if (existing.length > 0) {
      return res.status(409).json({ msg: 'Email already exists' });
    }

    const [subscription] = await db.query('SELECT * FROM subscriptions WHERE university_id = ? AND status = ?', [universityId, 'paid']);
    if (subscription.length === 0) {
      return res.status(400).json({ msg: 'Registration failed. The university is not subscribed to Internship-Connect.' });
    }

    const userId = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (user_id, username, password, role, is_complete) VALUES (?, ?, ?, ?, 1)', [userId, emailToRegister, hash, 'student']);

    const studentId = uuidv4();
    await db.query(
      `INSERT INTO students (student_id, user_id, university_id, matricNo, fullName, program, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, userId, universityId, matricNo, nameToRegister, program, mobileNumber]
    );

    sendRegistrationEmail(emailToRegister, nameToRegister, 'student');

    res.status(201).json({ msg: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getStudentDetails = async (req, res) => {
  const { studentId } = req.params;

  try {
    const query = `
      SELECT s.fullName, s.matricNo, u.username as email, s.program, s.phoneNumber as contactNumber
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.student_id = ?;`;

    const [results] = await db.query(query, [studentId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Database error (fetching student details):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student details.' });
  }
};
