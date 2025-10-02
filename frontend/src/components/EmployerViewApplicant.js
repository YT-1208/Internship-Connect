import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from './Footer';
import './EmployerViewApplicant.css';

const EmployerViewApplicant = () => {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/internships/${internshipId}/applicants`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setApplicants(data.data);
        } else {
          setError(data.message || 'Failed to fetch applicants.');
        }
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('An error occurred while fetching applicants.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [internshipId, navigate]);

  if (loading) {
    return (
      <div className="view-applicant-page">
        <div className="loading-container">Loading Applicants...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-applicant-page">
        <div className="error-container">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="view-applicant-page">
      <div className="view-applicant-container">
        <h2>Applicants for Internship</h2>
        {applicants.length > 0 ? (
          <div className="applicant-list">
            {applicants.map(applicant => (
              <div key={applicant.application_id} className="applicant-card">
                <h3>{applicant.fullName}</h3>
                <p><strong>University:</strong> {applicant.universityName}</p>
                <p><strong>Email:</strong> {applicant.email}</p>
                {/* Future: Add animation on hover and click to show details */}
              </div>
            ))}
          </div>
        ) : (
          <p>No applications for this internship yet.</p>
        )}
        <button onClick={() => navigate('/employer/my-internship')} className="btn btn-secondary mt-4 back-button">
          Back to My Internships
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default EmployerViewApplicant;
