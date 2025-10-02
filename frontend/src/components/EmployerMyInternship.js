import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployerNavbar from './EmployerNavbar';
import Footer from './Footer';
import './EmployerMyInternship.css';

const EmployerMyInternship = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInternships = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/employers/internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInternships(data.data);
      } else {
        setError(data.message || 'Failed to fetch internships.');
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('An error occurred while fetching internships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [navigate]);

  const handleCloseInternship = async (internshipId) => {
    if (window.confirm('Are you sure you want to close this internship?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/internships/close/${internshipId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          alert('Internship closed successfully!');
          fetchInternships(); // Re-fetch internships to update the list
        } else {
          alert(data.message || 'Failed to close internship.');
        }
      } catch (error) {
        console.error('Error closing internship:', error);
        alert('An error occurred while closing the internship.');
      }
    }
  };

  if (loading) {
    return (
      <div className="my-internships-page">
        <EmployerNavbar />
        <div className="loading-container">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-internships-page">
        <EmployerNavbar />
        <div className="error-container">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="my-internships-page">
      <EmployerNavbar />
      <div className="my-internships-container">
        <h2>My Posted Internships</h2>
        {internships.length > 0 ? (
          <table className="internships-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(internship => (
                <tr key={internship.internship_id}>
                  <td>{internship.title}</td>
                  <td>{internship.status}</td>
                  <td>
                    <Link to={`/employer/view-applicants/${internship.internship_id}`} className="btn btn-primary" style={{marginRight: '5px'}}>View Applicants</Link>
                    <Link to={`/employer/edit-internship/${internship.internship_id}`} className="btn btn-secondary" style={{marginRight: '5px'}}>Edit</Link>
                    <button className="btn btn-danger" onClick={() => handleCloseInternship(internship.internship_id)}>Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>You have not posted any internships yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EmployerMyInternship;