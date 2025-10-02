
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployerRegistration.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EmployerRegistration = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        password: '',
        companyIdNumber: '',
        fromGoogle: false,
        googleCredential: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.googleCredential) {
            const { googleCredential } = location.state;
            const decodedToken = jwtDecode(googleCredential);
            setFormData(prev => ({
                ...prev,
                companyEmail: decodedToken.email,
                companyName: decodedToken.name, // Pre-fill company name from Google name
                fromGoogle: true,
                googleCredential,
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleManualRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await axios.post('/api/employers/register', formData);
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
                            name="companyName"
                            value={formData.companyName} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="companyEmail">Company Email</label>
                        <input 
                            type="email" 
                            id="companyEmail" 
                            name="companyEmail"
                            value={formData.companyEmail} 
                            onChange={handleChange} 
                            required 
                            readOnly={formData.fromGoogle}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="companyIdNumber">Company ID (12 Digits)</label>
                        <input 
                            type="text" 
                            id="companyIdNumber" 
                            name="companyIdNumber"
                            value={formData.companyIdNumber} 
                            onChange={handleChange} 
                            required 
                            pattern="[0-9]{12}"
                            title="Company ID must be exactly 12 digits."
                            maxLength="12"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="companyPhone">Company Phone</label>
                        <input 
                            type="tel" 
                            id="companyPhone" 
                            name="companyPhone"
                            value={formData.companyPhone} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password"
                            value={formData.password} 
                            onChange={handleChange} 
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
