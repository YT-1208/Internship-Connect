import React, { useState, useEffect } from 'react';
import './EmployerHome.css'; // Import new styles
import Footer from './Footer';
import EmployerNavbar from './EmployerNavbar'; // Import the new navbar

const images = [
  '/assets/heroillustration1.jpg',
  '/assets/heroillustration2.jpg',
  '/assets/heroillustration3.jpg',
];

const EmployerHome = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({ totalInternships: 0, openPositions: 0, totalApplications: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentRatings, setRecentRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [statsRes, appsRes, ratingsRes] = await Promise.all([
          fetch('http://localhost:5000/api/employers/dashboard/stats', { headers }),
          fetch('http://localhost:5000/api/employers/dashboard/recent-applications', { headers }),
          fetch('http://localhost:5000/api/employers/dashboard/recent-ratings', { headers })
        ]);

        const statsData = await statsRes.json();
        const appsData = await appsRes.json();
        const ratingsData = await ratingsRes.json();

        if (statsData.success) setStats(statsData.data);
        if (appsData.success) setRecentApplications(appsData.data);
        if (ratingsData.success) setRecentRatings(ratingsData.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, []);

  return (
    <div className="employer-home">
      <EmployerNavbar />

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
          <h1>Post and Manage Your Internship Opportunities</h1>
          <p>Connect with talented and motivated students from top universities.</p>

        </div>
      </section>

      {/* Dashboard Section */}
      <div className="dashboard-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <section className="dashboard-section stats-section">
              <h2>Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Internships</h3>
                  <p>{stats.totalInternships}</p>
                </div>
                <div className="stat-card">
                  <h3>Open Positions</h3>
                  <p>{stats.openPositions}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Applications</h3>
                  <p>{stats.totalApplications}</p>
                </div>
              </div>
            </section>

            <section className="dashboard-section applications-section">
              <h2>Recent Applications</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Internship Title</th>
                      <th>Date Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.length > 0 ? (
                      recentApplications.map((app, index) => (
                        <tr key={index}>
                          <td>{app.fullName}</td>
                          <td>{app.title}</td>
                          <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3">No recent applications</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dashboard-section ratings-section">
              <h2>Recent Ratings</h2>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Rating</th>
                      <th>Feedback</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRatings.length > 0 ? (
                      recentRatings.map((rating, index) => (
                        <tr key={index}>
                          <td>{rating.fullName}</td>
                          <td>{rating.rating}/5</td>
                          <td>{rating.feedback}</td>
                          <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4">No recent ratings</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Top Companies Section */}
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
    </div>
  );
};

export default EmployerHome;
