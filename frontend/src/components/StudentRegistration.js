import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from'react';
import './StudentRegistration.css';
import { useNavigate, useLocation, Link } from'react-router-dom';
import axios from 'axios'; // If using Axios for API calls

const StudentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    universityId: '',
    matricNo: '',
    program: '',
    fromGoogle: false,
    googleCredential: null,
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (location.state?.googleCredential) {
      const { googleCredential } = location.state;
      const decodedToken = jwtDecode(googleCredential);
      setFormData(prev => ({
        ...prev,
        email: decodedToken.email,
        fromGoogle: true,
        googleCredential,
      }));
    }
  }, [location.state]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      alert('You must agree to the Terms and Conditions and Privacy Policy to register.');
      return;
    }

    // Basic frontend validation (optional; backend should also validate)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      await axios.post('/api/students/register', formData);
      alert('Registration successful! Please login.');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="student-registration-page">
      <div className="student-reg-container">
        <button onClick={() => navigate(-1)} className="back-button">Back</button>
        <h1>Registration form</h1>
        <p className="subtitle">
          Register to apply for jobs of your choice all over the world
        </p>

        <form className="reg-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full name*</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email ID */}
          <div className="form-group">
            <label htmlFor="email">Email ID*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email id"
              required
              readOnly={JSON.parse(localStorage.getItem('user'))?.fromGoogle}
            />
            <small>Job notifications will be sent to this email id</small>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="(Minimum 6 characters)"
              minLength={6}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
            <small>Remember your password</small>
          </div>

          {/* Mobile Number */}
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile number*</label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              required
            />
            <small>Recruiters will contact you on this number</small>
          </div>

          {/* University ID */}
          <div className="form-group">
            <label htmlFor="universityId">University ID*</label>
            <input
              type="text"
              id="universityId"
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              placeholder="Enter your university ID"
              required
            />
            <small>Your lecturer will verify your identity</small>
          </div>

          {/* Matric No */}
          <div className="form-group">
            <label htmlFor="matricNo">Matric No*</label>
            <input
              type="text"
              id="matricNo"
              name="matricNo"
              value={formData.matricNo}
              onChange={handleChange}
              placeholder="Enter your matric no"
              required
            />
          </div>

          {/* Program */}
          <div className="form-group">
            <label htmlFor="program">Program*</label>
            <input
              type="text"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              placeholder="Enter your program"
              required
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="form-group terms-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                By clicking Register, you agree to the 
                <Link to="/terms-and-conditions" className="terms-link"> Terms and Conditions </Link> & 
                <Link to="/privacy-policy" className="terms-link"> Privacy Policy </Link> 
                of Internship Connect.
              </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="register-btn" disabled={!agreedToTerms}>
            Register now
          </button>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;