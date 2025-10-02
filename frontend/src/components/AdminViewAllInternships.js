import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminViewAllInternships.css';
import AllInternshipDetails from './AllInternshipDetails'; // Assuming this is the modal component

const AdminViewAllInternships = () => {
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [industries, setIndustries] = useState([
        'Information Technology', 'Computer Science', 'Engineering & Manufacturing', 'Business Administrative', 'Finance', 'Management', 'Healthcare & Life Sciences', 'Media', 'Education', 'Science & Research', 'Law / Government & Public Services', 'Hospitality, Tourism & Lifestyle', 'Emerging & Future-Focesed Industries', 'Hotel Management', 'Acturial Science', 'Other'
    ]);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedInternship, setSelectedInternship] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Fetch all internships
        axios.get('http://localhost:5000/api/admin/internships', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setInternships(res.data.data);
                setFilteredInternships(res.data.data);
            })
            .catch(err => console.error("Error fetching internships:", err));
    }, []);

    const handleIndustryChange = (e) => {
        const industry = e.target.value;
        setSelectedIndustry(industry);
        if (industry) {
            if (industry === 'Other') {
                setFilteredInternships(internships.filter(internship => !industries.some(i => internship.industry.includes(i))));
            } else {
                setFilteredInternships(internships.filter(internship => internship.industry.includes(industry)));
            }
        } else {
            setFilteredInternships(internships);
        }
    };

    const handleViewDetails = (internship) => {
        setSelectedInternship(internship);
    };

    const handleCloseModal = () => {
        setSelectedInternship(null);
    };

    return (
        <div className="admin-view-all-internships">
            <button className="back-button-home" onClick={() => navigate('/admin/dashboard')}>Back to Home</button>
            <div className="content-wrapper">
                <div className="internship-listings">
                    <h2>All Internships</h2>
                    <div className="internship-grid">
                        {filteredInternships.map(internship => (
                            <div key={internship.internship_id} className="internship-card">
                                <img src={internship.profileImage} alt={`${internship.companyName} Profile`} className="company-profile-img" />
                                <h3>{internship.title}</h3>
                                <p>{internship.companyName}</p>
                                <p>{internship.area}</p>
                                <button onClick={() => handleViewDetails(internship)}>View Details</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="slicer">
                    <h3>Filter by Industry</h3>
                    <select value={selectedIndustry} onChange={handleIndustryChange}>
                        <option value="">All Industries</option>
                        {industries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedInternship && (
                <AllInternshipDetails
                    internship={selectedInternship}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AdminViewAllInternships;
