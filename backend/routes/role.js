const express = require('express');
const router = express.Router();

// Backend route redirects to React frontend route
router.get('/select-role', (req, res) => {
  res.redirect('/select-role'); // Points to React Router route
});

module.exports = router;