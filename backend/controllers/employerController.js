const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // Import uuid
const multer = require('multer');
const { sendRegistrationEmail } = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const upload = multer({ storage: multer.memoryStorage() });

// Register a new employer
exports.registerEmployer = async (req, res) => {
    const { companyName, companyEmail, companyPhone, password, companyIdNumber, fromGoogle, googleCredential } = req.body;
    let connection;

    try {
        let emailToRegister, nameToRegister;

        if (fromGoogle) {
            const ticket = await client.verifyIdToken({ idToken: googleCredential, audience: process.env.GOOGLE_CLIENT_ID });
            const payload = ticket.getPayload();
            emailToRegister = payload.email;
            nameToRegister = companyName || payload.name; // Prefer manually entered name
        } else {
            emailToRegister = companyEmail;
            nameToRegister = companyName;
        }

        if (!companyIdNumber || !/^\d{12}$/.test(companyIdNumber)) {
            return res.status(400).json({ message: 'Company ID must be exactly 12 digits.' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [existingUser] = await connection.query('SELECT * FROM users WHERE username = ?', [emailToRegister]);
        if (existingUser.length > 0) {
            await connection.rollback(); // Rollback before sending response
            connection.release();
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userId = uuidv4();
        const companyId = uuidv4();

        await connection.query('INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)', [userId, emailToRegister, hashedPassword, 'employer']);
        await connection.query('INSERT INTO employers (company_id, user_id, companyName, companyEmail, companyPhone, companyIdNumber) VALUES (?, ?, ?, ?, ?, ?)', [companyId, userId, nameToRegister, emailToRegister, companyPhone, companyIdNumber]);

        await connection.commit();
        sendRegistrationEmail(emailToRegister, nameToRegister, 'employer');

        res.status(201).json({ message: 'Employer registered successfully' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error registering employer:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        if (connection) connection.release();
    }
};

// Get employer details
exports.getEmployerDetails = async (req, res) => {
    const userId = req.params.id;
    try {
        const [results] = await db.query('SELECT * FROM employers WHERE user_id = ?', [userId]);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const employerDetails = results[0];
        if (employerDetails.profileImage && employerDetails.profileImageType) {
            employerDetails.profileImage = `data:${employerDetails.profileImageType};base64,${employerDetails.profileImage.toString('base64')}`;
        }
        return res.status(200).json({ success: true, data: employerDetails });
    } catch (err) {
        console.error('Database error (fetching employer details):', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve employer details.' });
    }
};

// Update employer details
exports.updateEmployerDetails = async (req, res) => {
    const userId = req.params.id;
    const { companyName, companyPhone, companyAddress, companyDescription } = req.body;

    try {
        let updateQuery = 'UPDATE employers SET companyName = ?, companyPhone = ?, companyAddress = ?, companyDescription = ?';
        const queryParams = [companyName, companyPhone, companyAddress, companyDescription];

        if (req.file) {
            updateQuery += ', profileImage = ?, profileImageType = ?';
            queryParams.push(req.file.buffer, req.file.mimetype);
        }

        updateQuery += ' WHERE user_id = ?';
        queryParams.push(userId);

        await db.query(updateQuery, queryParams);

        // Check for profile completeness
        const [employer] = await db.query('SELECT * FROM employers WHERE user_id = ?', [userId]);
        const isComplete = employer[0].companyName && employer[0].companyPhone && employer[0].companyAddress && employer[0].companyDescription && employer[0].profileImage;

        await db.query('UPDATE users SET is_complete = ? WHERE user_id = ?', [isComplete ? 1 : 0, userId]);

        return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('Database error (updating employer details):', err);
        return res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};

exports.checkProfileCompletion = async (req, res) => {
    const userId = req.params.userId;
    try {
        const [employer] = await db.query('SELECT * FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }

        const isComplete = employer[0].companyName &&
                           employer[0].companyPhone &&
                           employer[0].companyAddress &&
                           employer[0].companyDescription &&
                           employer[0].profileImage;

        res.status(200).json({ success: true, isComplete: !!isComplete });
    } catch (error) {
        console.error('Error checking profile completion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};



exports.getDashboardStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [employer] = await db.query('SELECT company_id FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const companyId = employer[0].company_id;

        const [internshipStats] = await db.query('SELECT COUNT(*) as totalInternships, SUM(CASE WHEN status = \'open\' THEN 1 ELSE 0 END) as openPositions FROM internships WHERE company_id = ?', [companyId]);
        const [applicationStats] = await db.query('SELECT COUNT(*) as totalApplications FROM applications WHERE internship_id IN (SELECT internship_id FROM internships WHERE company_id = ?)', [companyId]);

        res.status(200).json({
            success: true,
            data: {
                totalInternships: internshipStats[0].totalInternships || 0,
                openPositions: internshipStats[0].openPositions || 0,
                totalApplications: applicationStats[0].totalApplications || 0
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRecentApplications = async (req, res) => {
    const userId = req.user.id;
    try {
        const [employer] = await db.query('SELECT company_id FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const companyId = employer[0].company_id;

        const [applications] = await db.query(`
            SELECT s.fullName, i.title, a.appliedAt
            FROM applications a
            JOIN internships i ON a.internship_id = i.internship_id
            JOIN students s ON a.student_id = s.student_id
            WHERE i.company_id = ?
            ORDER BY a.appliedAt DESC
            LIMIT 5
        `, [companyId]);

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        console.error('Error getting recent applications:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRecentRatings = async (req, res) => {
    const userId = req.user.id;
    try {
        const [employer] = await db.query('SELECT company_id FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const companyId = employer[0].company_id;

        const [ratings] = await db.query(`
            SELECT s.fullName, r.rating, r.feedback, r.createdAt
            FROM ratings r
            JOIN students s ON r.student_id = s.student_id
            WHERE r.company_id = ?
            ORDER BY r.createdAt DESC
            LIMIT 5
        `, [companyId]);

        res.status(200).json({ success: true, data: ratings });
    } catch (error) {
        console.error('Error getting recent ratings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getEmployerInternships = async (req, res) => {
    const userId = req.user.id;
    try {
        const [employer] = await db.query('SELECT company_id FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const companyId = employer[0].company_id;

        const [internships] = await db.query('SELECT * FROM internships WHERE company_id = ?', [companyId]);

        res.status(200).json({ success: true, data: internships });
    } catch (error) {
        console.error('Error getting employer internships:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.upload = upload; // Export multer upload instance

exports.verifyEmployer = async (req, res) => {
    const employerId = req.params.id;
    try {
        // Check if the employer exists
        const [employer] = await db.query('SELECT * FROM employers WHERE company_id = ?', [employerId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }

        // Toggle the is_verified status
        const newVerifiedStatus = employer[0].is_verified === 0 ? 1 : 0; // Assuming 0 for false, 1 for true
        await db.query('UPDATE employers SET is_verified = ? WHERE company_id = ?', [newVerifiedStatus, employerId]);

        res.status(200).json({ success: true, message: `Employer ${newVerifiedStatus ? 'verified' : 'unverified'} successfully!` });
    } catch (error) {
        console.error('Error verifying employer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};