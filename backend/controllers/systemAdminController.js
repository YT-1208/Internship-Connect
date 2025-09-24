const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require('bcryptjs');
const db = require('../models/db'); // Your MySQL connection
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const { sendRegistrationEmail, sendVerificationEmail, sendRemovalEmail } = require('../utils/emailService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
exports.upload = upload;

// 1. Initiate subscription (for new/existing universities)
exports.initiateSubscription = async (req, res) => {
  const { university_id } = req.body;

  if (!university_id || university_id.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'University ID is required. Please enter a valid ID.',
    });
  }

  try {
    const [universityResult] = await db.query('SELECT * FROM universities WHERE university_id = ?', [university_id]);

    if (universityResult.length === 0) {
      await db.query(
        `INSERT INTO universities (university_id, name, created_at) VALUES (?, ?, ?)`,
        [university_id, `University-${university_id}`, new Date()]
      );
    }

    const [subscriptionResult] = await db.query(
      'SELECT * FROM subscriptions WHERE university_id = ? AND status = ?',
      [university_id, 'paid']
    );

    if (subscriptionResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This university already has an active subscription.',
      });
    }

    const subscriptionId = `SUB-${uuidv4()}`;
    const amount = 300.00;
    const subscribedAt = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    await db.query(
      `INSERT INTO subscriptions (subscription_id, university_id, subscribedAt, validUntil, status, amount) VALUES (?, ?, ?, ?, ?, ?)`,
      [subscriptionId, university_id, subscribedAt, validUntil, 'pending', amount]
    );

    return res.status(201).json({
      success: true,
      message: 'Subscription initiated. Proceed to admin registration.',
      data: { subscriptionId, amount },
    });

  } catch (err) {
    console.error('Database error during subscription initiation:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
    });
  }
};

// 2. Confirm payment and activate subscription (handles FPX)
exports.confirmPayment = async (req, res) => {
  const { subscriptionId, paymentDetails } = req.body;

  if (!subscriptionId || !paymentDetails) {
    return res.status(400).json({ success: false, message: 'Subscription ID and payment details are required.' });
  }

  const { payment_method, bank, account_number } = paymentDetails;

  if (payment_method === 'fpx' && (!bank || !account_number)) {
    return res.status(400).json({ success: false, message: 'Bank and account number are required for FPX payments.' });
  }

  try {
    const [subscriptionResult] = await db.query('SELECT * FROM subscriptions WHERE subscription_id = ? AND status = ?', [subscriptionId, 'pending']);

    if (subscriptionResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Pending subscription not found.' });
    }

    const paymentId = `PAY-${uuidv4()}`;
    const paidAt = new Date();
    const amount = subscriptionResult[0].amount;
    const transaction_id = `TXN-${uuidv4()}`;

    await db.query(
      `INSERT INTO payments (payment_id, subscription_id, amount, payment_method, status, paid_at, transaction_id, bank, account_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, subscriptionId, amount, payment_method, 'completed', paidAt, transaction_id, bank, account_number]
    );

    await db.query(
      `UPDATE subscriptions SET status = ?, payment_id = ? WHERE subscription_id = ?`,
      ['paid', paymentId, subscriptionId]
    );

    return res.status(200).json({
      success: true,
      message: 'Payment successful! Subscription is now active.',
      data: { paymentId, subscriptionId, validUntil: subscriptionResult[0].validUntil }
    });

  } catch (err) {
    console.error('Database error (confirming payment):', err);
    return res.status(500).json({ success: false, message: 'Payment confirmation failed.' });
  }
};

// 3. Register admin after payment
exports.registerAdmin = async (req, res) => {
  const { name, email, password, universityId, role, fromGoogle, googleCredential } = req.body;

  try {
    const emailToRegister = fromGoogle ? (await client.verifyIdToken({ idToken: googleCredential, audience: process.env.GOOGLE_CLIENT_ID })).getPayload().email : email;
    const nameToRegister = fromGoogle ? (await client.verifyIdToken({ idToken: googleCredential, audience: process.env.GOOGLE_CLIENT_ID })).getPayload().name : name;

    const [userResult] = await db.query('SELECT * FROM users WHERE username = ?', [emailToRegister]);

    if (userResult.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `USER-${uuidv4()}`;
    await db.query(`INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)`,
      [userId, emailToRegister, hashedPassword, role]
    );

    const systemAdminId = `SYSADMIN-${uuidv4()}`;
    await db.query(`INSERT INTO system_admins (systemAdmin_id, user_id, university_id, name, contactEmail) VALUES (?, ?, ?, ?, ?)`,
      [systemAdminId, userId, universityId, nameToRegister, emailToRegister]
    );

    sendRegistrationEmail(emailToRegister, nameToRegister);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully! You can now log in.',
      data: { systemAdminId, email: emailToRegister, universityId }
    });

  } catch (err) {
    console.error('Error in registerAdmin:', err);
    return res.status(500).json({ success: false, message: 'An error occurred during registration.' });
  }
};

// Get all internships
exports.getAllInternships = async (req, res) => {
  try {
    const query = `
      SELECT i.internship_id, i.title, i.description, i.requirements, i.status, i.eligibilityCriteria, i.createdAt, e.companyName, e.company_id
      FROM internships i
      JOIN employers e ON i.company_id = e.company_id
      WHERE i.status = 'open'
      ORDER BY i.createdAt DESC;`;
    const [results] = await db.query(query);
    return res.status(200).json({ success: true, message: 'Internships retrieved successfully.', data: results });
  } catch (err) {
    console.error('Database error (fetching internships):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve internships.' });
  }
};

// Get admin details
exports.getAdminDetails = async (req, res) => {
  const userId = req.params.id;
  try {
    const query = `
      SELECT sa.name as universityName, sa.university_id, sa.contactEmail, sa.position, sa.faculty, sa.phoneNumber, u.address, u.description, sa.profileImage, sa.profileImageType
      FROM system_admins sa
      JOIN universities u ON sa.university_id = u.university_id
      WHERE sa.user_id = ?;`;
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const adminDetails = results[0];
    if (adminDetails.profileImage && adminDetails.profileImageType) {
      adminDetails.profileImage = `data:${adminDetails.profileImageType};base64,${adminDetails.profileImage.toString('base64')}`;
    } else if (adminDetails.profileImage) {
      adminDetails.profileImage = `data:image/jpeg;base64,${adminDetails.profileImage.toString('base64')}`;
    }

    return res.status(200).json({ success: true, message: 'Admin details retrieved successfully.', data: adminDetails });
  } catch (err) {
    console.error('Database error (fetching admin details):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin details.' });
  }
};

// Update admin details
exports.updateAdminDetails = async (req, res) => {
  const userId = req.params.id;
  const { position, faculty, phoneNumber, address, description } = req.body;

  try {
    const [results] = await db.query('SELECT university_id FROM system_admins WHERE user_id = ?', [userId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    const universityId = results[0].university_id;

    let adminUpdateQuery = 'UPDATE system_admins SET position = ?, faculty = ?, phoneNumber = ?';
    const queryParams = [position, faculty, phoneNumber];

    if (req.file) {
      adminUpdateQuery += ', profileImage = ?, profileImageType = ?';
      queryParams.push(req.file.buffer, req.file.mimetype);
    }
    adminUpdateQuery += ' WHERE user_id = ?';
    queryParams.push(userId);

    await db.query(adminUpdateQuery, queryParams);
    await db.query(`UPDATE universities SET address = ?, description = ? WHERE university_id = ?;`, [address, description, universityId]);

    return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Database error (updating admin details):', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// Get University Details by ID
exports.getUniversityDetails = async (req, res) => {
  const { universityId } = req.params;
  try {
    const [results] = await db.query('SELECT university_id, name, address, description FROM universities WHERE university_id = ?', [universityId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }
    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Database error (fetching university details):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve university details.' });
  }
};

// Get Students by University ID
exports.getStudentsByUniversityId = async (req, res) => {
  const { universityId } = req.params;
  try {
    const query = `
      SELECT s.student_id, s.fullName AS name, s.matricNo AS matric_id, s.program AS programme, u.username AS email, s.is_verified
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.university_id = ?;`;
    const [results] = await db.query(query, [universityId]);
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error('Database error (fetching students by university ID):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve students.' });
  }
};

// Verify Student Account
exports.verifyStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [result] = await db.query('UPDATE students SET is_verified = 1 WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found or already verified.' });
    }
    return res.status(200).json({ success: true, message: 'Student verified successfully.' });
  } catch (err) {
    console.error('Database error (verifying student):', err);
    return res.status(500).json({ success: false, message: 'Failed to verify student.' });
  }
};

// Remove Student Account
exports.removeStudent = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [studentResults] = await db.query('SELECT user_id FROM students WHERE student_id = ?', [studentId]);
    if (studentResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const userId = studentResults[0].user_id;
    await db.query('DELETE FROM students WHERE student_id = ?', [studentId]);
    await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
    return res.status(200).json({ success: true, message: 'Student and associated user removed successfully.' });
  } catch (err) {
    console.error('Database error (removing student):', err);
    return res.status(500).json({ success: false, message: 'Failed to remove student.' });
  }
};

exports.sendVerificationNotification = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [results] = await db.query('SELECT s.fullName, u.username FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?', [studentId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const student = results[0];
    sendVerificationEmail(student.username, student.fullName);
    res.status(200).json({ success: true, message: 'Verification email sent successfully.' });
  } catch (err) {
    console.error('Database error (sending verification email):', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
};

exports.sendRemovalNotification = async (req, res) => {
  const { studentId } = req.params;
  try {
    const [results] = await db.query('SELECT s.fullName, u.username FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?', [studentId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const student = results[0];
    sendRemovalEmail(student.username, student.fullName);
    res.status(200).json({ success: true, message: 'Removal email sent successfully.' });
  } catch (err) {
    console.error('Database error (sending removal email):', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
};