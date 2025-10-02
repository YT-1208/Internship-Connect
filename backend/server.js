const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const systemAdminRoutes = require('./routes/systemAdmin');
const contactRoutes = require('./routes/contact'); // Import the contact route
const employerRoutes = require('./routes/employer'); // Import the employer route
const internshipRoutes = require('./routes/internships');
require('dotenv').config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());

// CORS Configuration (critical for frontend-backend communication)
app.use(cors({
  origin: '*' , // Temporarily allow all origins for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // Temporarily set to false for debugging
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is running" });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', systemAdminRoutes);
app.use('/api/contact', contactRoutes); // Use the contact route
app.use('/api/employers', employerRoutes); // Use the employer route
app.use('/api/internships', internshipRoutes);

// Database connection test
const testDbConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log("Database connected successfully");
    connection.end();
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testDbConnection(); // Test DB connection on startup
});