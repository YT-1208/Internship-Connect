
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // Import uuid

// Register a new employer
exports.registerEmployer = async (req, res) => {
    const { companyName, companyEmail, companyPhone, password } = req.body;
    const username = companyEmail; // Use email as username

    try {
        // Check if user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate UUIDs for user_id and company_id
        const userId = uuidv4();
        const companyId = uuidv4();

        // Start a transaction
        await db.beginTransaction();

        // Insert into users table
        await db.query('INSERT INTO users (user_id, username, password, role) VALUES (?, ?, ?, ?)', [userId, username, hashedPassword, 'employer']);

        // Insert into employers table
        await db.query('INSERT INTO employers (company_id, user_id, companyName, companyEmail, companyPhone) VALUES (?, ?, ?, ?, ?)', [companyId, userId, companyName, companyEmail, companyPhone]);

        // Commit the transaction
        await db.commit();

        res.status(201).json({ message: 'Employer registered successfully' });

    } catch (error) {
        // Rollback the transaction in case of error
        await db.rollback();
        console.error('Error registering employer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
