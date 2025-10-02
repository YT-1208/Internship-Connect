import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ViewEmployers.css';
import './Button.css';
import EmployerDetailsModal from './EmployerDetailsModal';

const ViewEmployers = () => {
  console.log("ViewEmployers component rendering...");
  const navigate = useNavigate();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEmployers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/admin/employers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setEmployers(data.data);
        } else {
          setError(data.message || 'Failed to fetch employers.');
        }
      } catch (err) {
        console.error('Error fetching employers:', err);
        setError('An error occurred while fetching employers.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, [navigate]);


  const handleUpdateEmployerStatus = async (employerId, action) => {
    const endpoint = action;

    if (window.confirm(`Are you sure you want to ${action} this employer?`)) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const response = await fetch(`http://localhost:5000/api/admin/employer/${endpoint}/${employerId}`, {
          method: 'PUT',
          headers
        });

        const data = await response.json();
        if (data.success) {
          alert(`Employer ${action}ed successfully!`);
          // Re-fetch employers to get the updated status
          const fetchEmployers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login');
              return;
            }

            try {
              const response = await fetch('http://localhost:5000/api/admin/employers', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              const data = await response.json();
              if (data.success) {
                setEmployers(data.data);
              } else {
                setError(data.message || 'Failed to fetch employers.');
              }
            } catch (err) {
              console.error('Error fetching employers:', err);
              setError('An error occurred while fetching employers.');
            }
          };
          fetchEmployers();
        } else {
          alert(data.message || `Failed to ${action} employer.`);
        }
      } catch (err) {
        console.error(`Error ${action}ing employer:`, err);
        alert(`An error occurred while ${action}ing the employer.`);
      }
    }
  };

  const handleViewEmployer = async (employerId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`http://localhost:5000/api/admin/employer/${employerId}`, { headers });
      const data = await response.json();
      if (data.success) {
        setSelectedEmployer(data.data);
        setIsModalOpen(true);
      } else {
        alert(data.message || 'Failed to fetch employer details.');
      }
    } catch (err) {
      console.error('Error fetching employer details:', err);
      alert('An error occurred while fetching employer details.');
    }
  };

  const handleCloseModal = () => {
    setSelectedEmployer(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="view-employers-page">
        <Navbar />
        <div className="loading-container">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-employers-page">
        <Navbar />
        <div className="error-container">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  const pendingEmployers = employers.filter(e => !e.is_verified);
  const verifiedEmployers = employers.filter(e => e.is_verified);

  return (
    <div className="view-employers-page">
      <Navbar />
      <div className="view-employers-container">
        <div className="employers-intro">
          <h2>View Employers</h2>
          <p>Here you can manage all the employer accounts in the system.</p>
        </div>

        <div className="employers-list-section">
          <h3>Pending Employers Verification</h3>
          {pendingEmployers.length > 0 ? (
            <table className="employers-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEmployers.map(employer => (
                  <tr key={employer.employer_id}>
                    <td>{employer.company_name}</td>
                    <td>{employer.email}</td>
                    <td>
                      <button
                        onClick={() => handleViewEmployer(employer.employer_id)}
                        className="btn btn-primary view-btn"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateEmployerStatus(employer.employer_id, 'unblock')}
                        className="btn btn-primary verify-btn"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleUpdateEmployerStatus(employer.employer_id, 'block')}
                        className="btn btn-primary remove-btn"
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No employers pending for verification.</p>
          )}
        </div>

        <div className="employers-list-section">
          <h3>Verified Employers</h3>
          {verifiedEmployers.length > 0 ? (
            <table className="employers-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiedEmployers.map(employer => (
                  <tr key={employer.employer_id}>
                    <td>{employer.company_name}</td>
                    <td>{employer.email}</td>
                    <td>
                      <button
                        onClick={() => handleViewEmployer(employer.employer_id)}
                        className="btn btn-primary view-btn"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleUpdateEmployerStatus(employer.employer_id, 'block')}
                        className="btn btn-primary remove-btn"
                      >
                        Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No employers have been verified yet.</p>
          )}
        </div>
      </div>
      <Footer />
      {isModalOpen && <EmployerDetailsModal employer={selectedEmployer} onClose={handleCloseModal} />}
    </div>
  );
};
export default ViewEmployers;
