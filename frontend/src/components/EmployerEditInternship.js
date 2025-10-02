import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmployerNavbar from './EmployerNavbar';
import Footer from './Footer';
import './PostInternship.css';

const EmployerEditInternship = () => {
  const navigate = useNavigate();
  const { internshipId } = useParams();
  const [loading, setLoading] = useState(true);
  const [internshipDetails, setInternshipDetails] = useState({
    title: '',
    description: '',
    requirements: '',
    eligibilityCriteria: '',
    district: '',
    state: '',
    salary_min: '',
    salary_max: '',
    industries: [''],
    expiryDate: ''
  });
  const [otherIndustries, setOtherIndustries] = useState({});

  const industryOptions = [
    'Information Technology',
    'Computer Science',
    'Engineering & Manufacturing',
    'Business Administrative',
    'Finance',
    'Management',
    'Healtcare & Life Sciences',
    'Media',
    'Education',
    'Science & Research',
    'Law/Government & Public services',
    'Hospitality, Tourism & Lifestyle',
    'Emerging & Future-Focused Industries',
    'Hotel Management',
    'Acturial Science',
    'Other'
  ];

  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Perak', 'Perlis', 'Pahang', 'Penang', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'Negeri Sembilan', 'Malacca', 'Kuala Lumpur', 'Putrajaya', 'Labuan'
  ];

  useEffect(() => {
    console.log('internshipId from useParams:', internshipId);
    const fetchInternshipDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/internships/${internshipId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('raw data', data);
        if (data.success) {
          const { title, description, requirements, eligibilityCriteria, area, salary, industry, expiryDate } = data.data;
          console.log('area', area);
          console.log('salary', salary);
          console.log('industry', industry);
          const [district, state] = area ? area.split(', ') : ['', ''];
          const [salary_min, salary_max] = salary ? salary.replace(/RM/g, '').split(' - ') : ['', ''];
          const industries = industry ? industry.split(', ') : [''];
          console.log('district', district);
          console.log('state', state);
          console.log('salary_min', salary_min);
          console.log('salary_max', salary_max);
          console.log('industries', industries);
          setInternshipDetails({
            title,
            description,
            requirements,
            eligibilityCriteria,
            district,
            state,
            salary_min,
            salary_max,
            industries,
            expiryDate: new Date(expiryDate).toISOString().split('T')[0]
          });
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching internship details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [internshipId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInternshipDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleIndustryChange = (index, value) => {
    const newIndustries = [...internshipDetails.industries];
    newIndustries[index] = value;
    setInternshipDetails(prevState => ({ ...prevState, industries: newIndustries }));
  };

  const addIndustry = () => {
    setInternshipDetails(prevState => ({ ...prevState, industries: [...prevState.industries, ''] }));
  };

  const removeIndustry = (index) => {
    const newIndustries = internshipDetails.industries.filter((_, i) => i !== index);
    setInternshipDetails(prevState => ({ ...prevState, industries: newIndustries }));
    const newOtherIndustries = { ...otherIndustries };
    delete newOtherIndustries[index];
    setOtherIndustries(newOtherIndustries);
  };

  const handleOtherIndustryChange = (index, value) => {
    setOtherIndustries(prevState => ({ ...prevState, [index]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (internshipDetails.salary_min <= 0 || internshipDetails.salary_max <= 0) {
      alert('Salary must be a positive value.');
      return;
    }

    if (parseInt(internshipDetails.salary_min) >= parseInt(internshipDetails.salary_max)) {
        alert('The minimum salary must be less than the maximum salary.');
        return;
    }

    const token = localStorage.getItem('token');
    
    const finalIndustries = internshipDetails.industries.map((industry, index) => {
      if (industry === 'Other') {
        return otherIndustries[index] || '';
      }
      return industry;
    }).join(', ');

    const finalInternshipDetails = {
      ...internshipDetails,
      industry: finalIndustries,
      area: `${internshipDetails.district}, ${internshipDetails.state}`,
      salary: `RM${internshipDetails.salary_min} - RM${internshipDetails.salary_max}`
    };
    delete finalInternshipDetails.industries;
    delete finalInternshipDetails.district;
    delete finalInternshipDetails.state;
    delete finalInternshipDetails.salary_min;
    delete finalInternshipDetails.salary_max;

    try {
      const response = await fetch(`http://localhost:5000/api/internships/${internshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalInternshipDetails)
      });
      const data = await response.json();
      if (data.success) {
        alert('Internship updated successfully!');
        navigate('/employer/my-internship');
      } else {
        alert('Failed to update internship: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating internship:', error);
      alert('An error occurred while updating the internship.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <EmployerNavbar />
      <div className="post-internship-container">
        <div className="post-internship-form">
          <h2>Edit Internship</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" name="title" value={internshipDetails.title} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea name="description" value={internshipDetails.description} onChange={handleInputChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Requirements (Enter one per line)</label>
              <textarea name="requirements" value={internshipDetails.requirements} onChange={handleInputChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Eligibility Criteria (Enter one per line)</label>
              <textarea name="eligibilityCriteria" value={internshipDetails.eligibilityCriteria} onChange={handleInputChange} required></textarea>
            </div>
            <div className="form-group">
              <label>Location</label>
              <div className="location-inputs">
                <input type="text" name="district" placeholder="District" value={internshipDetails.district} onChange={handleInputChange} required />
                <select name="state" value={internshipDetails.state} onChange={handleInputChange} required>
                  <option value="" disabled>Select a state</option>
                  {malaysianStates.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Estimated Salary</label>
              <div className="salary-inputs">
                <span>RM</span>
                <input type="number" name="salary_min" min="1" value={internshipDetails.salary_min} onChange={handleInputChange} required />
                <span>- RM</span>
                <input type="number" name="salary_max" min="1" value={internshipDetails.salary_max} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" name="expiryDate" value={internshipDetails.expiryDate} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Industry</label>
              {internshipDetails.industries.map((industry, index) => (
                <div key={index} className="industry-input-group">
                  <select value={industry} onChange={(e) => handleIndustryChange(index, e.target.value)} required>
                    <option value="" disabled>Select an industry</option>
                    {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {internshipDetails.industries.length > 1 && (
                    <button type="button" onClick={() => removeIndustry(index)} className="btn-remove">Remove</button>
                  )}
                  {industry === 'Other' && (
                    <input 
                      type="text" 
                      placeholder="Please specify" 
                      value={otherIndustries[index] || ''} 
                      onChange={(e) => handleOtherIndustryChange(index, e.target.value)} 
                      required 
                    />
                  )}
                </div>
              ))}
              <button type="button" onClick={addIndustry} className="btn-add">Add Industry</button>
            </div>

            <button type="submit" className="btn btn-primary">Update Internship</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployerEditInternship;
