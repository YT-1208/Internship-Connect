import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemAdminNavbar from './SystemAdminNavbar';
import Footer from './Footer';
import './Subscription.css';

const SystemAdminSubscription = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setSubscription(data.data);
        } else {
          setError(data.message || 'Failed to fetch subscription details.');
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('An error occurred while fetching subscription details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [navigate]);

  const handleExtendSubscription = () => {
    // Navigate to payment page with relevant data
    navigate('/admin-payment', { state: { amount: 300, universityId: subscription.university_id } });
  };

  if (loading) {
    return (
      <div className="subscription-container">
        <SystemAdminNavbar />
        <div className="loading-container">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-container">
        <SystemAdminNavbar />
        <div className="error-container">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <SystemAdminNavbar />
      <div className="subscription-content">
        <h2>My Subscription</h2>
        {subscription ? (
          <div className="subscription-details">
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Start Date:</strong> {new Date(subscription.subscribedAt).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(subscription.validUntil).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> RM{subscription.amount}</p>
            <button onClick={handleExtendSubscription} className="btn btn-primary">Extend Subscription (12 months for RM300)</button>
          </div>
        ) : (
          <p>No active subscription found.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SystemAdminSubscription;
