import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const EmployerNavbar = () => {
  const [companyName, setCompanyName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchEmployerDetails = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (user && user.user_id && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/employers/${user.user_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('EmployerNavbar: API Response Status', response.status);
          const data = await response.json();
          console.log('EmployerNavbar: Fetched Data', data);
          if (data.success) {
            setCompanyName(data.data.companyName);
            if (data.data.profileImage) {
              setProfileImageUrl(data.data.profileImage);
            }
          }
        } catch (error) {
          console.error('Error fetching employer details:', error);
        }
      }
    };
    fetchEmployerDetails();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img 
          src="/assets/internshipconnect_logo.png" 
          alt="Internship Connect Logo" 
          className="logo-img" 
        />
        <span className="logo-text">INTERNSHIP CONNECT</span>
      </div>
      <div className="navbar-links">
        <Link to="/employer/dashboard" className="nav-link">Home</Link>
        <Link to="/employer/post-internship" className="nav-link">Post Internships</Link>
        <Link to="/employer/my-internship" className="nav-link">My Internships</Link>
      </div>
      <div className="navbar-user">
        {profileImageUrl && <img src={profileImageUrl} alt="Profile" className="navbar-profile-img"/>}
        <Link to="/employer/profile" className="welcome-text">Welcome, {companyName}</Link>
        <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default EmployerNavbar;
