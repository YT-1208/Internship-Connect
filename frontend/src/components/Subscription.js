import React, { useState } from 'react';
import './Subscription.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Subscription = () => {
  // State for form input and loading/error handling
  const [universityId, setUniversityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { googleCredential } = location.state || {};

  // Validate University ID format (UNI-XXXXXX)
  const isValidUniversityId = (id) => {
    const regex = /^UNI-\d{6}$/; // Matches UNI followed by 6 digitsss
    return regex.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    // Client-side validation for ID format
    if (!isValidUniversityId(universityId)) {
      setErrorMessage('Invalid University ID format. Use: UNI-XXXXXX (e.g., UNI-123456)');
      setLoading(false);
      return;
    }

    try {
      // API endpoint for initiating subscription
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/admin/initiate-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send ONLY university_id (no name required here)
        body: JSON.stringify({ university_id: universityId })
      });

      // Parse response
      const data = await response.json();

      // Handle server errors responses
      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed. Please check your University ID.');
      }

      // On success: Navigate to Admin Registration with subscription data
      navigate('/admin-registration', { 
        state: { 
          subscriptionId: data.data.subscriptionId, // Pass subscription ID
          amount: data.data.amount, // Pass amount (RM 300)
          universityId: universityId, // Pass university ID for reference
          googleCredential, // Pass the googleCredential
        } 
      });

    } catch (error) {
      // Show error to user
      setErrorMessage(error.message);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="subscription-container">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate('/select-role')}>Back</button>

      {/* Subscription form */}
      <form onSubmit={handleSubmit} className="subscription-form">
        <h2>University Subscription</h2>
        
        {/* University ID input */}
        <div className="form-group">
          <label htmlFor="universityId">University ID</label>
          <input
            type="text"
            id="universityId"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value.trim())}
            placeholder="UNI-XXXXXX (e.g., UNI-123456)"
            required
            disabled={loading} // Disable during loading
            className="university-id-input"
          />
          <small className="format-hint">Format: UNI followed by 6 digits (e.g., UNI-123456)</small>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {/* Subscription info */}
        <p className="subscription-info">
          Unlock full access with our Annual University Subscription. Manage internships, student data, and employer partnershipsssin one platform.
        </p>

        {/* Subscription details */}
        <div className="subscription-content">
          <div className="plan">
            <h3>Subscription Plan</h3>
            <div className="plan-box">12 Months - RM 300.00</div>
          </div>

          <div className="benefits">
            <h3>Benefits:</h3>
            <ul>
              <li>Full student access to internships</li>
              <li>Staff portal for student data management</li>
              <li>Employer partnership dashboard</li>
              <li>Analytics and reporting tools</li>
              <li>Secure data protection</li>
            </ul>
          </div>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          className="confirm-button" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Subscription'}
        </button>

        <p className="powered-by">Powered by Internship Connect</p>
      </form>
    </div>
  );
};

export default Subscription;