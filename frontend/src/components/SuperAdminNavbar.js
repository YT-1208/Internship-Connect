import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SuperAdminNavbar.css'; // Import the CSS for the navbar

const SuperAdminNavbar = () => {
  const navigate = useNavigate();
  const superAdminName = "Super Admin"; // Placeholder for the Super Admin's name

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="superadmin-navbar">
      <div className="superadmin-navbar-brand">
        <Link to="/superadmin/home">InternshipConnect</Link>
      </div>
      <ul className="superadmin-navbar-nav">
        <li className="nav-item">
          <Link to="/superadmin/manage-subscriptions" className="nav-link">Manage Subscriptions</Link>
        </li>
        <li className="nav-item">
          <Link to="/superadmin/manage-employers" className="nav-link">Manage Employers</Link>
        </li>
        <li className="nav-item dropdown">
          <span className="nav-link dropdown-toggle">Welcome, {superAdminName}</span>
          <div className="dropdown-menu">
            <Link to="/superadmin/profile" className="dropdown-item">Profile</Link>
            <button onClick={handleLogout} className="dropdown-item logout-button">Logout</button>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default SuperAdminNavbar;
