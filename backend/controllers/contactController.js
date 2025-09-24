const db = require('../models/db');

exports.submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  try {
    const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    await db.query(query, [name, email, message]);

    return res.status(201).json({
      success: true,
      message: 'Message submitted successfully!',
    });
  } catch (err) {
    console.error('Database error (submitting contact form):', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit message. Please try again later.',
    });
  }
};
