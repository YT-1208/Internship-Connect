import React from 'react';
import { Link } from 'react-router-dom';
import './SystemAdminNavbar.css';

const SystemAdminNavbar = () => {
  return (
    <nav className="system-admin-navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/assets/internshipconnect_logo.png" alt="InternshipConnect Logo" />
        </Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/view-companies">View Company</Link></li>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/settings">Settings</Link></li>
        <li><Link to="/admin/profile">Profile</Link></li>
        <li><Link to="/admin/subscription">My Subscription</Link></li>
      </ul>
      <div className="navbar-logout">
        <Link to="/logout">Logout</Link>
      </div>
    </nav>
  );
};

export default SystemAdminNavbar;
