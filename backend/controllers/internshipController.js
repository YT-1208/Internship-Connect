const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

exports.postInternship = async (req, res) => {
    console.log(req.body);
    const { title, description, requirements, eligibilityCriteria, area, salary, industry, expiryDate } = req.body;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    try {
        const [employer] = await db.query('SELECT company_id FROM employers WHERE user_id = ?', [userId]);
        if (employer.length === 0) {
            return res.status(404).json({ success: false, message: 'Employer not found.' });
        }
        const companyId = employer[0].company_id;

        const internshipId = uuidv4();
        const query = 'INSERT INTO internships (internship_id, company_id, title, description, requirements, eligibilityCriteria, area, salary, industry, status, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(query, [internshipId, companyId, title, description, requirements, eligibilityCriteria, area, salary, industry, 'OPEN', expiryDate]);

        res.status(201).json({ success: true, message: 'Internship posted successfully', internshipId });
    } catch (error) {
        console.error('Error posting internship:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getInternshipById = async (req, res) => {
    const { internshipId } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM internships WHERE internship_id = ?', [internshipId]);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Internship not found.' });
        }
        return res.status(200).json({ success: true, data: results[0] });
    } catch (err) {
        console.error('Database error (fetching internship details):', err);
        return res.status(500).json({ success: false, message: 'Failed to retrieve internship details.' });
    }
};

exports.updateInternship = async (req, res) => {
    const { internshipId } = req.params;
    const { title, description, requirements, eligibilityCriteria, area, salary, industry, expiryDate } = req.body;

    try {
        const query = 'UPDATE internships SET title = ?, description = ?, requirements = ?, eligibilityCriteria = ?, area = ?, salary = ?, industry = ?, expiryDate = ? WHERE internship_id = ?';
        await db.query(query, [title, description, requirements, eligibilityCriteria, area, salary, industry, expiryDate, internshipId]);

        res.status(200).json({ success: true, message: 'Internship updated successfully' });
    } catch (error) {
        console.error('Error updating internship:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.closeInternship = async (req, res) => {
    const { internshipId } = req.params;
    try {
        const query = 'UPDATE internships SET status = ? WHERE internship_id = ?';
        await db.query(query, ['closed', internshipId]);
        res.status(200).json({ success: true, message: 'Internship closed successfully' });
    } catch (error) {
        console.error('Error closing internship:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getApplicantsForInternship = async (req, res) => {
    const { internshipId } = req.params;
    try {
        const query = `
            SELECT
                a.application_id,
                s.fullName,
                u.username AS email,
                uni.name AS universityName
            FROM applications a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            JOIN universities uni ON s.university_id = uni.university_id
            WHERE a.internship_id = ?;
        `;
        const [applicants] = await db.query(query, [internshipId]);
        res.status(200).json({ success: true, data: applicants });
    } catch (error) {
        console.error('Error fetching applicants for internship:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
