const db = require('../models/db');

exports.submitContactForm = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.',
    });
  }

  const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
  db.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('Database error (submitting contact form):', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit message. Please try again later.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Message submitted successfully!',
    });
  });
};
