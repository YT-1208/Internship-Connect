import React, { useState, useEffect } from 'react';
import './SystemAdminHome.css'; // Import custom CSS
import { Link, useNavigate } from 'react-router-dom'; // For navigation links
import Footer from './Footer'; // Import the Footer component
import './Button.css'; // Import the new button styles
import Navbar from './Navbar'; // Import the Navbar component

// Correctly reference images from the public folder by their path
const images = [
  '/assets/heroillustration1.jpg',
  '/assets/heroillustration2.jpg',
  '/assets/heroillustration3.jpg',
];

const SystemAdminHome = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await fetch('/api/admin/internships'); // Assuming your backend is served from the same origin
        const data = await response.json();
        if (data.success) {
          setInternships(data.data);
        } else {
          console.error('Failed to fetch internships:', data.message);
        }
      } catch (error) {
        console.error('Error fetching internships:', error);
      }
    };

    fetchInternships();
  }, []);

  return (
    <div className="system-admin-home">
      {/* Navbar Section */}
      <Navbar />

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
          <h1>Find an Internship that aligns with your field and skills</h1>
          <p>Lists of opportunities in all the leading sector are waiting for you.</p>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Job title, Keyword..." 
              className="search-input" 
            />
            <input 
              type="text" 
              placeholder="Location" 
              className="location-input" 
            />
            <button className="btn btn-primary">View</button>
          </div>
          <p className="suggestions">Suggestion: UI/UX Designer, Programing, Digital Marketing, Video, Animation.</p>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="featured-opportunities">
        <h2>Featured Opportunities</h2>
        <p>Choose internships from the top employers and apply for the same.</p>
        <div className="opportunities-grid">
            {internships.length > 0 ? (
              internships.map((internship) => (
                <div className="opportunity-card" key={internship.internship_id}>
                  <h3>{internship.title}</h3>
                  <span className="availability">{internship.status.toUpperCase()}</span>
                  {/* Assuming salary is part of description or requirements for now, or needs to be added to DB */}
                  <p className="salary">Salary: Not specified</p>
                  <div className="company-info">
                    {/* Placeholder for company logo - you might need to fetch this from the backend or have a default */}
                    <img
                      src="/assets/default-company-logo.png" // Placeholder
                      alt={`${internship.companyName} Logo`}
                      className="company-logo"
                    />
                    <p>{internship.companyName}</p>
                    {/* Assuming location is part of description or requirements for now, or needs to be added to DB */}
                    <p>Location: Not specified</p>
                  </div>
                  {/* Assuming applicants count is not directly available from internship table */}
                  <p className="applicants">Applicants: N/A</p>
                  <button className="view-details-btn">View details</button>
                </div>
              ))
            ) : (
              <p>No featured opportunities available at the moment.</p>
            )}
          </div>
        <Link to="/admin/all-opportunities" className="view-all-link">View all</Link>
      </section>

      {/* Top Companies Section */}
      <section className="top-companies">
        <h3>Top companies hiring now</h3>
        <div className="companies-grid">
          <img 
            src="/assets/htmPharmacy_logo.png" 
            alt="HTM Pharmacy Logo" 
            className="company-logo" 
          />
          <img 
            src="/assets/carsem_logo.png" 
            alt="Carsem Logo" 
            className="company-logo" 
          />
          <img 
            src="/assets/keeming_logo.png" 
            alt="Kee Ming Logo" 
            className="company-logo" 
          />
          <img 
            src="/assets/travelodge_logo.png" 
            alt="Travelodge Logo" 
            className="company-logo" 
          />
          <img 
            src="/assets/topGlove_logo.png" 
            alt="Top Glove Logo" 
            className="company-logo" 
          />
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default SystemAdminHome;