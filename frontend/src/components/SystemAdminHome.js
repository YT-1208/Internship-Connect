import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SystemAdminHome.css'; // Import custom CSS
import Footer from './Footer'; // Import the Footer component
import Navbar from './Navbar'; // Import the Navbar component
import AllInternshipDetails from './AllInternshipDetails';

const images = [
  '/assets/heroillustration1.jpg',
  '/assets/heroillustration2.jpg',
  '/assets/heroillustration3.jpg',
];

const SystemAdminHome = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allInternships, setAllInternships] = useState([]); 
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [errorInternships, setErrorInternships] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    const fetchAllInternships = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch('http://localhost:5000/api/admin/internships', { headers }); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
          // Assuming data.data is an array of internships, each potentially with an applications array
          setAllInternships(data.data);
        }
      } catch (error) {
        console.error("Error fetching all internships:", error);
        setErrorInternships(error);
      } finally {
        setLoadingInternships(false);
      }
    };

    fetchAllInternships();

    return () => clearInterval(timer);
  }, []);

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
  };

  const handleCloseModal = () => {
    setSelectedInternship(null);
  };

  const handleViewAllInternships = () => {
    navigate('/admin/view-all-internships');
  };

  const handleRemarkChange = (internshipId, applicationId, value) => {
    setAllInternships(prevInternships =>
      prevInternships.map(internship =>
        internship.internship_id === internshipId
          ? { ...internship, applications: internship.applications.map(app =>
              app.id === applicationId ? { ...app, remark: value } : app
            ) }
          : internship
      )
    );
  };

  const handleSaveRemark = async (internshipId, applicationId, remark) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      // Replace with your actual API endpoint for saving remarks
      const response = await fetch(`http://localhost:5000/api/admin/opportunities/${internshipId}/applications/${applicationId}/remark`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ remark })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      alert('Remark saved successfully!');
    } catch (error) {
      console.error("Error saving remark:", error);
      alert('Failed to save remark.');
    }
  };

  return (
    <div className="system-admin-home">
      <Navbar />
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
          <p className="hero-description">Lists of opportunities in all the leading sector are waiting for you.</p>
        </div>
      </section>

      <section className="featured-opportunities">
        <h2>All Internships</h2>
        {loadingInternships ? (
          <p>Loading internships...</p>
        ) : errorInternships ? (
          <p>Error loading internships: {errorInternships.message}</p>
        ) : allInternships.length > 0 ? (
          <>
            <div className="opportunities-grid">
              {allInternships.slice(0, 2).map((internship) => (
                <div className="opportunity-card" key={internship.internship_id}>
                  <div className="opportunity-card-header">
                    <h3 onClick={() => handleViewDetails(internship)}>{internship.title}</h3>
                    {internship.profileImage && (
                      <img src={internship.profileImage} alt={`${internship.companyName} Profile`} className="company-profile-img" />
                    )}
                  </div>
                  <p>{internship.companyName}</p>
                  <p>Salary: {internship.salary}</p>
                  {internship.applications && internship.applications.length > 0 && (
                    <div className="applications-list">
                      <h4>Applications:</h4>
                      {internship.applications.map(app => (
                        <div key={app.id} className="application-item">
                          <p>Student: {app.studentName} (University: {app.universityId})</p>
                          <textarea
                            placeholder="Add remark..."
                            value={app.remark || ''}
                            onChange={(e) => handleRemarkChange(internship.internship_id, app.id, e.target.value)}
                          />
                          <button
                            onClick={() => handleSaveRemark(internship.internship_id, app.id, app.remark)}
                          >Save Remark</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button className="view-more-btn" onClick={() => handleViewDetails(internship)}>View Details</button>
                </div>
              ))}
            </div>
            <button className="view-more-btn" onClick={handleViewAllInternships}>View All Internships</button>
          </>
        ) : (
          <p>No internships available at the moment.</p>
        )}
      </section>

      <section className="top-companies">
        <h3>Top companies hiring now</h3>
        <div className="companies-grid">
          <img src="/assets/htmPharmacy_logo.png" alt="HTM Pharmacy Logo" className="company-logo" />
          <img src="/assets/carsem_logo.png" alt="Carsem Logo" className="company-logo" />
          <img src="/assets/keeming_logo.png" alt="Kee Ming Logo" className="company-logo" />
          <img src="/assets/travelodge_logo.png" alt="Travelodge Logo" className="company-logo" />
          <img src="/assets/topGlove_logo.png" alt="Top Glove Logo" className="company-logo" />
        </div>
      </section>



      <Footer />

      {selectedInternship && (
        <AllInternshipDetails
            internship={selectedInternship}
            onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SystemAdminHome;