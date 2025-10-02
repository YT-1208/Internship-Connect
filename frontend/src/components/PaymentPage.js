import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const banks = [
  'Maybank2u',
  'CIMB Clicks',
  'Public Bank',
  'RHB Now',
  'Hong Leong Connect',
  'AmOnline',
  'Bank Islam',
  'Bank Rakyat',
  'BSN'
];

const PaymentPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem('registrationData');
    if (data) {
      setRegistrationData(JSON.parse(data));
    } else {
      alert('Invalid access: No registration data found. Please start from the registration page.');
      navigate('/admin-registration');
    }
  }, [navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!selectedBank) {
      setErrorMessage('Please select a bank.');
      return;
    }
    if (!bankAccount.trim()) {
      setErrorMessage('Please enter a bank account number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setPaymentStatus('Processing FPX payment...');

    // Simulate redirection and payment processing
    setTimeout(async () => {
      try {
        const { subscriptionId, adminData } = registrationData;

        const paymentData = {
          subscriptionId,
          paymentDetails: {
            payment_method: 'fpx',
            bank: selectedBank,
            account_number: bankAccount
          }
        };

        const response = await fetch('http://localhost:5000/api/admin/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Payment failed. Please try again.');
        }

        setPaymentStatus('Payment successful! Registering your account...');

        if (adminData) {
          const registerResponse = await fetch('http://localhost:5000/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminData)
          });

          if (!registerResponse.ok) {
            const registerError = await registerResponse.json();
            throw new Error(registerError.message || 'Payment successful, but admin registration failed.');
          }
        }

        sessionStorage.removeItem('registrationData');
        setPaymentStatus('Payment successful! Thank you for using Internship Connect.');
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Wait 2 seconds before redirecting

      } catch (error) {
        setErrorMessage(`Payment failed: ${error.message}`);
        setPaymentStatus('');
        setLoading(false);
      }
    }, 3000); // 3-second delay to simulate FPX process
  };

  if (!registrationData) {
    return null; // Don't render anything until registration data is loaded
  }

  return (
    <div className="subscription-container">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>

      <div className="payment-form-wrapper">
        <h2>Complete Your Payment</h2>
        <p className="amount-display">Total Amount: RM {registrationData.amount.toFixed(2)}</p>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}
        {paymentStatus && (
          <p className="payment-status">{paymentStatus}</p>
        )}

        {!paymentStatus && (
          <form onSubmit={handlePayment}>
            <div className="form-group">
              <label htmlFor="bank">Select Your Bank</label>
              <select
                id="bank"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                required
                className="payment-input"
              >
                <option value="" disabled>Choose a bank</option>
                {banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bankAccount">Bank Account Number</label>
              <input
                type="text"
                id="bankAccount"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                required
                className="payment-input"
                placeholder="Enter your bank account number"
              />
            </div>

            <div className="fpx-payment-info">
              <p>You will be redirected to pay using FPX online banking.</p>
            </div>

            <button 
              type="submit" 
              className="confirm-button" 
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay RM ${registrationData.amount.toFixed(2)} with FPX`}
            </button>
          </form>
        )}
      </div>

      <p className="powered-by">Powered by Internship Connect</p>
    </div>
  );
};

export default PaymentPage;