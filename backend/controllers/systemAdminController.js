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

    // Fetch subscription details for the invoice
    const [subscription] = await db.query('SELECT * FROM subscriptions WHERE university_id = ? AND status = ?', [universityId, 'paid']);
    if (subscription.length > 0) {
      const invoiceDetails = {
        name: nameToRegister,
        email: emailToRegister,
        amount: subscription[0].amount,
        startDate: subscription[0].subscribedAt,
        endDate: subscription[0].validUntil
      };
      sendRegistrationEmail(emailToRegister, nameToRegister, 'system admin', invoiceDetails);
    } else {
      sendRegistrationEmail(emailToRegister, nameToRegister, 'system admin');
    }

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
exports.getInternshipById = async (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to fetch internship details for ID: ${id}`);
  try {
    const internshipQuery = `
      SELECT 
        i.internship_id, 
        i.title, 
        i.description, 
        i.requirements, 
        i.status, 
        i.eligibilityCriteria, 
        i.createdAt, 
        i.salary, 
        e.companyName, 
        e.company_id, 
        e.profileImage, 
        e.companyDescription AS companyDescription,
        e.companyAddress,
        i.area,
        i.expiryDate
      FROM internships i
      JOIN employers e ON i.company_id = e.company_id
      WHERE i.internship_id = ?;`;
    const [internshipResults] = await db.query(internshipQuery, [id]);

    if (internshipResults.length === 0) {
      console.log(`Internship with ID ${id} not found.`);
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }

    const internship = internshipResults[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (internship.expiryDate && new Date(internship.expiryDate) < today && internship.status === 'OPEN') {
      await db.query('UPDATE internships SET status = ? WHERE internship_id = ?', ['Closed', internship.internship_id]);
      internship.status = 'Closed';
    }

    if (internship.profileImage) {
      internship.profileImage = `data:image/jpeg;base64,${internship.profileImage.toString('base64')}`;
    }

    // Fetch applications for this internship
    const applicationsQuery = `
      SELECT 
        ia.application_id AS id, 
        s.fullName AS studentName, 
        s.university_id AS universityId
      FROM applications ia
      JOIN students s ON ia.student_id = s.student_id
      WHERE ia.internship_id = ?;`;
    const [applicationResults] = await db.query(applicationsQuery, [id]);

    internship.applications = applicationResults;

    console.log(`Internship details fetched for ID: ${id}`);
    return res.status(200).json({ success: true, message: 'Internship details retrieved successfully.', data: internship });
  } catch (err) {
    console.error('Database error (fetching single internship):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve internship details.' });
  }
};

exports.getAllInternships = async (req, res) => {
  console.log("Attempting to fetch all internships for system admin...");
  try {
    const query = `
      SELECT 
        i.internship_id, 
        i.title, 
        i.description, 
        i.requirements, 
        i.status, 
        i.eligibilityCriteria, 
        i.createdAt, 
                i.salary, 
                e.companyName, 
                e.company_id, 
                e.profileImage,
                i.industry,
                i.area,
                i.expiryDate      FROM internships i
      JOIN employers e ON i.company_id = e.company_id
      ORDER BY i.createdAt DESC;`;
    const [results] = await db.query(query);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const internship of results) {
      if (internship.expiryDate && new Date(internship.expiryDate) < today && internship.status === 'OPEN') {
        await db.query('UPDATE internships SET status = ? WHERE internship_id = ?', ['Closed', internship.internship_id]);
        internship.status = 'Closed';
      }
    }

    const internshipsWithApplications = results.map(internship => {
      if (internship.profileImage) {
        internship.profileImage = `data:image/jpeg;base64,${internship.profileImage.toString('base64')}`;
      }
      return {
        ...internship,
        applications: [] // Placeholder for applications
      };
    });

    console.log("Internships fetched:", internshipsWithApplications.length);
    return res.status(200).json({ success: true, message: 'Internships retrieved successfully.', data: internshipsWithApplications });
  } catch (err) {
    console.error('Database error (fetching internships):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve internships.' });
  }
};

// Get admin details
exports.getAdminDetails = async (req, res) => {
  const userId = req.params.id;
  console.log(`Attempting to fetch admin details for userId: ${userId}`);
  try {
    const query = `
      SELECT sa.name as universityName, sa.university_id, sa.contactEmail, sa.position, sa.faculty, sa.phoneNumber, u.address, u.description, sa.profileImage, sa.profileImageType
      FROM system_admins sa
      JOIN universities u ON sa.university_id = u.university_id
      WHERE sa.user_id = ?;`;
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      console.log(`Admin not found for userId: ${userId}`);
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const adminDetails = results[0];
    console.log("Admin details fetched:", adminDetails.university_id);
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

exports.getAllEmployers = async (req, res) => {
  console.log("Attempting to fetch all employers for system admin...");
  const universityId = req.user.university_id; // Get university_id from authenticated admin

  try {
    const query = `
      SELECT
        e.company_id as employer_id,
        e.companyName as company_name,
        u.username as email,
        e.is_verified,
        CASE WHEN ueb.company_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_blocked
      FROM employers e
      JOIN users u ON e.user_id = u.user_id
      LEFT JOIN university_employer_blocks ueb ON e.company_id = ueb.company_id AND ueb.university_id = ?
      ORDER BY e.createdAt DESC;`;
    const [results] = await db.query(query, [universityId]);

    console.log("Employers fetched:", results.length);
    return res.status(200).json({ success: true, message: 'Employers retrieved successfully.', data: results });
  } catch (err) {
    console.error('Database error (fetching employers):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employers.' });
  }
};
exports.verifyEmployer = async (req, res) => {
  const { employerId } = req.params;
  try {
    // Check current status
    const [employer] = await db.query('SELECT is_verified FROM employers WHERE company_id = ?', [employerId]);
    if (employer.length === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found.' });
    }
    const newVerifiedStatus = employer[0].is_verified === 0 ? 1 : 0; // Toggle status

    const [result] = await db.query('UPDATE employers SET is_verified = ? WHERE company_id = ?', [newVerifiedStatus, employerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found or status not changed.' });
    }
    return res.status(200).json({ success: true, message: `Employer ${newVerifiedStatus ? 'verified' : 'unverified'} successfully!` });
  } catch (err) {
    console.error('Database error (toggling employer verification):', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle employer verification.' });
  }
};

exports.blockEmployer = async (req, res) => {
  const { employerId } = req.params;
  try {
    const [result] = await db.query('UPDATE employers SET is_verified = 0 WHERE company_id = ?', [employerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found.' });
    }
    return res.status(200).json({ success: true, message: 'Employer blocked successfully.' });
  } catch (err) {
    console.error('Database error (blocking employer):', err);
    return res.status(500).json({ success: false, message: 'Failed to block employer.' });
  }
};

exports.unblockEmployer = async (req, res) => {
  const { employerId } = req.params;
  try {
    const [result] = await db.query('UPDATE employers SET is_verified = 1 WHERE company_id = ?', [employerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found.' });
    }
    return res.status(200).json({ success: true, message: 'Employer unblocked successfully.' });
  } catch (err) {
    console.error('Database error (unblocking employer):', err);
    return res.status(500).json({ success: false, message: 'Failed to unblock employer.' });
  }
};

exports.toggleEmployerBlock = async (req, res) => {
  const { employerId } = req.params;
  const universityId = req.user.university_id; // Assuming university_id is available in req.user

  try {
    // Check if the employer exists
    const [employerExists] = await db.query('SELECT company_id FROM employers WHERE company_id = ?', [employerId]);
    if (employerExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found.' });
    }

    // Check if already blocked by this university
    const [blockStatus] = await db.query('SELECT * FROM university_employer_blocks WHERE university_id = ? AND company_id = ?', [universityId, employerId]);

    if (blockStatus.length > 0) {
      // Employer is blocked, so unblock them
      await db.query('DELETE FROM university_employer_blocks WHERE university_id = ? AND company_id = ?', [universityId, employerId]);
      return res.status(200).json({ success: true, message: 'Employer unblocked successfully for this university.' });
    } else {
      // Employer is not blocked, so block them
      const blockId = uuidv4();
      await db.query('INSERT INTO university_employer_blocks (block_id, university_id, company_id) VALUES (?, ?, ?)', [blockId, universityId, employerId]);
      return res.status(200).json({ success: true, message: 'Employer blocked successfully for this university.' });
    }
  } catch (err) {
    console.error('Database error (toggling employer block):', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle employer block status.' });
  }
};

exports.getEmployerById = async (req, res) => {
  const { employerId } = req.params;
  const universityId = req.user.university_id; // Get university_id from authenticated admin

  try {
    const query = `
      SELECT
        e.company_id,
        e.companyName,
        e.companyDescription,
        e.companyAddress,
        e.companyPhone,
        u.username as email,
        e.profileImage,
        e.profileImageType,
        e.is_verified,
        CASE WHEN ueb.company_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_blocked
      FROM employers e
      JOIN users u ON e.user_id = u.user_id
      LEFT JOIN university_employer_blocks ueb ON e.company_id = ueb.company_id AND ueb.university_id = ?
      WHERE e.company_id = ?;`;
    const [results] = await db.query(query, [universityId, employerId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Employer not found.' });
    }

    const employer = results[0];
    if (employer.profileImage && employer.profileImageType) {
      employer.profileImage = `data:${employer.profileImageType};base64,${employer.profileImage.toString('base64')}`;
    } else if (employer.profileImage) {
      employer.profileImage = `data:image/jpeg;base64,${employer.profileImage.toString('base64')}`;
    }

    return res.status(200).json({ success: true, message: 'Employer details retrieved successfully.', data: employer });
  } catch (err) {
    console.error('Database error (fetching single employer):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employer details.' });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  const universityId = req.user.university_id;

  try {
    const [results] = await db.query('SELECT * FROM subscriptions WHERE university_id = ?', [universityId]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }
    return res.status(200).json({ success: true, data: results[0] });
  } catch (err) {
    console.error('Database error (fetching subscription details):', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscription details.' });
  }
};