import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './AdminRegistration.css';

const AdminRegistration = () => {
  // Get subscription data from previous page (Subscription.js)
  const location = useLocation();
  const { subscriptionId, amount, universityId: incomingUniversityId, googleCredential } = location.state || {};
  
  // Form state for admin details
  const [formData, setFormData] = useState({
    name: '',
    email: googleCredential ? jwtDecode(googleCredential).email : '',
    password: '',
    confirmPassword: '',
    universityId: incomingUniversityId || '', // Pre-fill with university ID from subscription
    role: 'system admin', // Default role
    fromGoogle: googleCredential ? true : false,
    googleCredential: googleCredential || null,
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!incomingUniversityId || !subscriptionId) {
      navigate('/subscription'); // Redirect to subscription if invalid
    }
  }, [navigate, incomingUniversityId, subscriptionId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!agreedToTerms) {
      alert('You must agree to the Terms and Conditions and Privacy Policy to continue.');
      return;
    }

    // Validate form data
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (!formData.name || !formData.email) {
      setErrorMessage('Name and email are required');
      return;
    }

    // Store data in session storage to persist across navigation
    const registrationData = {
      adminData: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        universityId: formData.universityId,
        role: formData.role
      },
      subscriptionId: subscriptionId,
      amount: amount
    };
    sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

    // Navigate to payment page
    navigate('/admin-payment');
  };

  return (
    <div className="admin-registration-container"> {/* Fixed container class name */}
      <button className="back-button" onClick={() => navigate('/admin-subscription')}>Back</button>

      <div className="registration-form">
        <h2>System Admin Registration</h2>
        <p>Complete your details to create your admin account</p>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* University ID (read-only, pre-filled) */}
          <div className="form-group">
            <label>University ID</label>
            <input
              type="text"
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              readOnly // Prevent editing (from subscription)
              className="readonly-input"
            />
          </div>

          {/* Admin Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Admin Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@university.com"
              readOnly={JSON.parse(localStorage.getItem('user'))?.fromGoogle}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="form-group terms-group">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the 
              <Link to="/terms-and-conditions" className="terms-link">Terms & Conditions</Link> and 
              <Link to="/privacy-policy" className="terms-link">Privacy Policy</Link>.
            </label>
          </div>

          {/* Submit button */}
          <button type="submit" className="register-now-btn" disabled={!agreedToTerms}> {/* Fixed button class name */}
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;