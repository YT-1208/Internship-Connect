
const db = require('../models/db');
const bcrypt = require('bcryptjs');

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

        // Start a transaction
        await db.beginTransaction();

        // Insert into users table
        const [newUser] = await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'employer']);
        const userId = newUser.insertId;

        // Insert into employers table
        await db.query('INSERT INTO employers (user_id, companyName, companyEmail, companyPhone) VALUES (?, ?, ?, ?)', [userId, companyName, companyEmail, companyPhone]);

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
