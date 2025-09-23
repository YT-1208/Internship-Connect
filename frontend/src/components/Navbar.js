import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [universityName, setUniversityName] = useState('');
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
    const fetchAdminDetails = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user_id) {
        try {
          const response = await fetch(`http://localhost:5000/api/admin/${user.user_id}`);
          const data = await response.json();
          if (data.success) {
            setUniversityName(data.data.universityName);
            if (data.data.profileImage) {
              setProfileImageUrl(data.data.profileImage);
            }
          }
        } catch (error) {
          console.error('Error fetching admin details:', error);
        }
      }
    };
    fetchAdminDetails();
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
        <Link to="/admin/dashboard" className="nav-link">Home</Link>
        <Link to="/admin/manage-students" className="nav-link">Manage Student</Link>
        <Link to="/admin/view-internships" className="nav-link">View Internship</Link>
      </div>
      <div className="navbar-user">
        {profileImageUrl && <img src={profileImageUrl} alt="Profile" className="navbar-profile-img"/>}
        <Link to="/admin/profile" className="welcome-text">Welcome, {universityName}</Link>
        <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
