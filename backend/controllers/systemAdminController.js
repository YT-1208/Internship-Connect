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
    // Step 1: Check if university exists
    const [universityResult] = await db.promise().query('SELECT * FROM universities WHERE university_id = ?', [university_id]);

    // If university does NOT exist, create it first
    if (universityResult.length === 0) {
      await db.promise().query(
        `INSERT INTO universities (university_id, name, created_at) VALUES (?, ?, ?)`,
        [university_id, `University-${university_id}`, new Date()]
      );
    }

    // Step 2: Check for an existing active subscription
    const [subscriptionResult] = await db.promise().query(
      'SELECT * FROM subscriptions WHERE university_id = ? AND status = ?',
      [university_id, 'paid']
    );

    if (subscriptionResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This university already has an active subscription.',
      });
    }

    // Step 3: Create a new pending subscription
    const subscriptionId = `SUB-${uuidv4()}`;
    const amount = 300.00;
    const subscribedAt = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    await db.promise().query(
      `INSERT INTO subscriptions (subscription_id, university_id, subscribedAt, validUntil, status, amount) VALUES (?, ?, ?, ?, ?, ?)`,
      [subscriptionId, university_id, subscribedAt, validUntil, 'pending', amount]
    );

    // Success response
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
exports.confirmPayment = (req, res) => {
  const { subscriptionId, paymentDetails } = req.body;

  // Validate input
  if (!subscriptionId || !paymentDetails) {
    return res.status(400).json({
      success: false,
      message: 'Subscription ID and payment details are required.'
    });
  }

  const { payment_method, bank, account_number } = paymentDetails;

  // FPX-specific validation
  if (payment_method === 'fpx' && (!bank || !account_number)) {
    return res.status(400).json({
      success: false,
      message: 'Bank and account number are required for FPX payments.'
    });
  }

  // Step 1: Check if subscription exists and is pending
  db.query(
    'SELECT * FROM subscriptions WHERE subscription_id = ? AND status = ?',
    [subscriptionId, 'pending'],
    (err, subscriptionResult) => {
      if (err) {
        console.error('Database error (checking subscription):', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to verify subscription.'
        });
      }

      if (subscriptionResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pending subscription not found. Please start a new subscription.'
        });
      }

      // Step 2: Record payment
      const paymentId = `PAY-${uuidv4()}`;
      const paidAt = new Date();
      const amount = subscriptionResult[0].amount;

      const { payment_method, bank, account_number } = paymentDetails;
      const transaction_id = `TXN-${uuidv4()}`;

      db.query(
        `INSERT INTO payments 
         (payment_id, subscription_id, amount, payment_method, status, paid_at, transaction_id, bank, account_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentId,
          subscriptionId,
          amount,
          payment_method,
          'completed',
          paidAt,
          transaction_id,
          bank,
          account_number
        ],
        (err, paymentResult) => {
          if (err) {
            console.error('Database error (recording payment):', err);
            return res.status(500).json({
              success: false,
              message: 'Payment failed to record. Please try again.'
            });
          }

          // Step 3: Update subscription to paid
          db.query(
            `UPDATE subscriptions 
             SET status = ?, payment_id = ? 
             WHERE subscription_id = ?`,
            ['paid', paymentId, subscriptionId],
            (err, updateResult) => {
              if (err) {
                console.error('Database error (updating subscription):', err);
                return res.status(500).json({
                  success: false,
                  message: 'Payment recorded but subscription not activated. Contact support.'
                });
              }

              // Success: Payment confirmed and subscription activated
              return res.status(200).json({
                success: true,
                message: 'Payment successful! Subscription is now active.',
                data: {
                  paymentId: paymentId,
                  subscriptionId: subscriptionId,
                  validUntil: subscriptionResult[0].validUntil
                }
              });
            }
          );
        }
      );
    }
  );
};

// 3. Register admin after payment (fixed to use correct tables)
exports.registerAdmin = async (req, res) => {
  const { name, email, password, universityId, role, fromGoogle, googleCredential } = req.body;

  try {
    if (fromGoogle) {
      // Google SSO Registration
      const ticket = await client.verifyIdToken({
        idToken: googleCredential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email: googleEmail, name: googleName } = payload;

      const [userResult] = await db.promise().query('SELECT * FROM users WHERE username = ?', [googleEmail]);

      if (userResult.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Use a different email.'
        });
      }

      const userId = `USER-${uuidv4()}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.promise().query(
        `INSERT INTO users 
         (user_id, username, password, role)
         VALUES (?, ?, ?, ?)`,
        [userId, googleEmail, hashedPassword, role]
      );

      const systemAdminId = `SYSADMIN-${uuidv4()}`;
      await db.promise().query(
        `INSERT INTO system_admins 
         (systemAdmin_id, user_id, university_id, name, contactEmail)
         VALUES (?, ?, ?, ?, ?)`,
        [systemAdminId, userId, universityId, googleName, googleEmail]
      );

      // Send registration email
      console.log('Attempting to send registration email for Google SSO user:', googleEmail);
      sendRegistrationEmail(googleEmail, googleName);

      return res.status(201).json({
        success: true,
        message: 'Admin account created successfully! You can now log in.',
        data: {
          systemAdminId: systemAdminId,
          email: googleEmail,
          universityId: universityId
        }
      });
    } else {
      // Manual Registration
      if (!name || !email || !password || !universityId) {
        return res.status(400).json({
          success: false,
          message: 'All fields (name, email, password, university ID) are required.'
        });
      }

      const [userResult] = await db.promise().query('SELECT * FROM users WHERE username = ?', [email]);

      if (userResult.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This email is already registered. Use a different email.'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = `USER-${uuidv4()}`;
      await db.promise().query(
        `INSERT INTO users 
         (user_id, username, password, role)
         VALUES (?, ?, ?, ?)`,
        [userId, email, hashedPassword, role]
      );

      const systemAdminId = `SYSADMIN-${uuidv4()}`;
      await db.promise().query(
        `INSERT INTO system_admins 
         (systemAdmin_id, user_id, university_id, name, contactEmail)
         VALUES (?, ?, ?, ?, ?)`,
        [systemAdminId, userId, universityId, name, email]
      );

      // Send registration email
      console.log('Attempting to send registration email for manual user:', email);
      sendRegistrationEmail(email, name);

      return res.status(201).json({
        success: true,
        message: 'Admin account created successfully! You can now log in.',
        data: {
          systemAdminId: systemAdminId,
          email: email,
          universityId: universityId
        }
      });
    }
  } catch (err) {
    console.error('Error in registerAdmin:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
};

// Get all internships
exports.getAllInternships = (req, res) => {
  const query = `
    SELECT
      i.internship_id,
      i.title,
      i.description,
      i.requirements,
      i.status,
      i.eligibilityCriteria,
      i.createdAt,
      e.companyName,
      e.company_id
    FROM internships i
    JOIN employers e ON i.company_id = e.company_id
    WHERE i.status = 'open'
    ORDER BY i.createdAt DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error (fetching internships):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve internships. Please try again later.'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Internships retrieved successfully.',
      data: results
    });
  });
};

// Get admin details
exports.getAdminDetails = (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT
      sa.name as universityName,
      sa.university_id,
      sa.contactEmail,
      sa.position,
      sa.faculty,
      sa.phoneNumber,
      u.address,
      u.description,
      sa.profileImage,
      sa.profileImageType
    FROM system_admins sa
    JOIN universities u ON sa.university_id = u.university_id
    WHERE sa.user_id = ?;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Database error (fetching admin details):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin details. Please try again later.'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.'
      });
    }

    const adminDetails = results[0];
    if (adminDetails.profileImage && adminDetails.profileImageType) {
      adminDetails.profileImage = `data:${adminDetails.profileImageType};base64,${adminDetails.profileImage.toString('base64')}`;
    } else if (adminDetails.profileImage) { // Fallback if type is missing
      adminDetails.profileImage = `data:image/jpeg;base64,${adminDetails.profileImage.toString('base64')}`;
    }

    return res.status(200).json({
      success: true,
      message: 'Admin details retrieved successfully.',
      data: adminDetails
    });
  });
};

// Update admin details
exports.updateAdminDetails = (req, res) => {
  const userId = req.params.id;
  const { position, faculty, phoneNumber, address, description } = req.body;
  console.log('Received file:', req.file);

  // First, get the university_id from the system_admins table
  db.query('SELECT university_id FROM system_admins WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Database error (fetching university_id):', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const universityId = results[0].university_id;

    let adminUpdateQuery = 'UPDATE system_admins SET position = ?, faculty = ?, phoneNumber = ?';
    const queryParams = [position, faculty, phoneNumber];

    if (req.file) {
      adminUpdateQuery += ', profileImage = ?, profileImageType = ?';
      queryParams.push(req.file.buffer);
      queryParams.push(req.file.mimetype);
      console.log('Updating profileImage with buffer length:', req.file.buffer.length);
      console.log('Updating profileImageType:', req.file.mimetype);
    }

    adminUpdateQuery += ' WHERE user_id = ?';
    queryParams.push(userId);

    // Update system_admins table
    db.query(adminUpdateQuery, queryParams, (err, adminUpdateResult) => {
      if (err) {
        console.error('Database error (updating system_admins):', err);
        console.error('SQL Query:', adminUpdateQuery);
        console.error('Query Params:', queryParams);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
      }
      console.log('Admin profile updated in DB:', adminUpdateResult);

      // Update universities table
      const universityUpdateQuery = `
        UPDATE universities
        SET address = ?, description = ?
        WHERE university_id = ?;
      `;
      db.query(universityUpdateQuery, [address, description, universityId], (err, universityUpdateResult) => {
        if (err) {
          console.error('Database error (updating universities):', err);
          return res.status(500).json({ success: false, message: 'Failed to update university address.' });
        }

        return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
      });
    });
  });
};

// Get University Details by ID
exports.getUniversityDetails = (req, res) => {
  const universityId = req.params.universityId;

  const query = 'SELECT university_id, name, address, description FROM universities WHERE university_id = ?';
  db.query(query, [universityId], (err, results) => {
    if (err) {
      console.error('Database error (fetching university details):', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve university details.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }

    return res.status(200).json({ success: true, data: results[0] });
  });
};

// Get Students by University ID
exports.getStudentsByUniversityId = (req, res) => {
  const universityId = req.params.universityId;

  const query = `
    SELECT
      s.student_id,
      s.fullName AS name,
      s.matricNo AS matric_id,
      s.program AS programme,
      u.username AS email, -- Added this line to fetch the email
      s.is_verified
    FROM students s
    JOIN users u ON s.user_id = u.user_id -- Added this JOIN
    WHERE s.university_id = ?;
  `;

  db.query(query, [universityId], (err, results) => {
    if (err) {
      console.error('Database error (fetching students by university ID):', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve students.' });
    }

    return res.status(200).json({ success: true, data: results });
  });
};

// Verify Student Account
exports.verifyStudent = (req, res) => {
  const studentId = req.params.studentId;

  const query = 'UPDATE students SET is_verified = 1 WHERE student_id = ?';
  db.query(query, [studentId], (err, result) => {
    if (err) {
      console.error('Database error (verifying student):', err);
      return res.status(500).json({ success: false, message: 'Failed to verify student.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found or already verified.' });
    }

    return res.status(200).json({ success: true, message: 'Student verified successfully.' });
  });
};

// Remove Student Account
exports.removeStudent = (req, res) => {
  const studentId = req.params.studentId;

  // First, get the user_id associated with the student_id
  db.query('SELECT user_id FROM students WHERE student_id = ?', [studentId], (err, studentResults) => {
    if (err) {
      console.error('Database error (fetching user_id for student removal):', err);
      return res.status(500).json({ success: false, message: 'Failed to remove student.' });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const userId = studentResults[0].user_id;

    // Delete from students table
    db.query('DELETE FROM students WHERE student_id = ?', [studentId], (err, studentDeleteResult) => {
      if (err) {
        console.error('Database error (deleting student):', err);
        return res.status(500).json({ success: false, message: 'Failed to remove student.' });
      }

      // Delete from users table
      db.query('DELETE FROM users WHERE user_id = ?', [userId], (err, userDeleteResult) => {
        if (err) {
          console.error('Database error (deleting user):', err);
          return res.status(500).json({ success: false, message: 'Failed to remove user.' });
        }

        return res.status(200).json({ success: true, message: 'Student and associated user removed successfully.' });
      });
    });
  });
};

exports.sendVerificationNotification = (req, res) => {
  const studentId = req.params.studentId;
  db.query('SELECT s.fullName, u.username FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?', [studentId], (err, results) => {
    if (err) {
      console.error('Database error (fetching student details for verification email):', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = results[0];
    sendVerificationEmail(student.username, student.fullName);
    res.status(200).json({ success: true, message: 'Verification email sent successfully.' });
  });
};

exports.sendRemovalNotification = (req, res) => {
  const studentId = req.params.studentId;
  db.query('SELECT s.fullName, u.username FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.student_id = ?', [studentId], (err, results) => {
    if (err) {
      console.error('Database error (fetching student details for removal email):', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = results[0];
    sendRemovalEmail(student.username, student.fullName);
    res.status(200).json({ success: true, message: 'Removal email sent successfully.' });
  });
};