
import React, { useState } from 'react';
import axios from 'axios';
import './EmployerRegistration.css';
import { useNavigate } from 'react-router-dom';

const EmployerRegistration = () => {
    const [companyName, setCompanyName] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleManualRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('/api/employers/register', { 
                companyName, 
                companyEmail, 
                companyPhone, 
                password 
            });
            setSuccess(res.data.message);
            alert('Registration successful! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="employer-registration-container">
            <div className="employer-registration-card">
                <button onClick={() => navigate(-1)} className="back-button">Back</button>
                <h2>Employer Registration</h2>
                <p>Create your employer account to connect with talented students.</p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleManualRegister}>
                    <div className="input-group">
                        <label htmlFor="companyName">Company Name</label>
                        <input 
                            type="text" 
                            id="companyName" 
                            value={companyName} 
                            onChange={(e) => setCompanyName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="companyEmail">Company Email</label>
                        <input 
                            type="email" 
                            id="companyEmail" 
                            value={companyEmail} 
                            onChange={(e) => setCompanyEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="companyPhone">Company Phone</label>
                        <input 
                            type="tel" 
                            id="companyPhone" 
                            value={companyPhone} 
                            onChange={(e) => setCompanyPhone(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="manual-register-btn">Register</button>
                </form>
            </div>
        </div>
    );
};

export default EmployerRegistration;
