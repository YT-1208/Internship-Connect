import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SuperAdminNavbar from './SuperAdminNavbar'; // Import the new navbar
import Footer from './Footer';
import './SuperAdminHome.css'; // Import new styles

const images = [
  '/assets/heroillustration1.jpg',
  '/assets/heroillustration2.jpg',
  '/assets/heroillustration3.jpg',
];

const SuperAdminHome = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  return (
    <div className="superadmin-home">
      <SuperAdminNavbar />

      {/* Hero Section */}
      <section className="hero">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Hero Background"
            className={`hero-background-img ${index === currentImageIndex ? 'active' : ''}`}
          />
        ))}
        <div className="hero-content">
          <h1>Welcome, Super Admin!</h1>
          <p>Manage the InternshipConnect platform with ease.</p>
          {/* No search bar for Super Admin */}
        </div>
      </section>

      {/* Super Admin Dashboard Section - Placeholder for unique content */}
      <div className="superadmin-dashboard-container">
        <section className="dashboard-section">
          <h2>Platform Overview</h2>
          <p>This section will contain unique statistics and management tools for the Super Admin.</p>
          {/* Example: Quick links to manage subscriptions, employers, system admins */}
          <div className="superadmin-quick-links">
            <Link to="/superadmin/manage-subscriptions" className="quick-link-card">
              <h3>Manage Subscriptions</h3>
              <p>View and manage all university subscriptions.</p>
            </Link>
            <Link to="/superadmin/manage-employers" className="quick-link-card">
              <h3>Manage Employers</h3>
              <p>Oversee employer accounts and their activities.</p>
            </Link>
            {/* Add more quick links as needed */}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminHome;
