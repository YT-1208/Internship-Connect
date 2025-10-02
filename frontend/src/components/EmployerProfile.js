import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SystemAdminProfile.css'; // Reuse styles
import Footer from './Footer';
import EmployerNavbar from './EmployerNavbar';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [employerDetails, setEmployerDetails] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyDescription: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerDetails = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (user && user.user_id && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/employers/${user.user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setEmployerDetails(data.data);
            if (data.data.profileImage) {
              setPreviewImage(data.data.profileImage);
            }
          }
        } catch (error) {
          console.error('Error fetching employer details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchEmployerDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployerDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user && user.user_id && token) {
      const formData = new FormData();
      formData.append('companyName', employerDetails.companyName);
      formData.append('companyPhone', employerDetails.companyPhone);
      formData.append('companyAddress', employerDetails.companyAddress);
      formData.append('companyDescription', employerDetails.companyDescription);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      try {
        const response = await fetch(`http://localhost:5000/api/employers/${user.user_id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          alert('Profile updated successfully!');
        } else {
          alert('Failed to update profile: ' + data.message);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <EmployerNavbar />
      <div className="profile-container">
        <div className="profile-form">
          <button onClick={() => navigate('/employer/dashboard')} className="btn btn-primary">Back</button>
          <h2>Edit Company Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group profile-image-section">
              <label>Company Logo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {previewImage && <img src={previewImage} alt="Profile Preview" className="profile-preview"/>}
            </div>
            
            <div className="form-group">
              <label>Company Email</label>
              <input type="email" name="companyEmail" value={employerDetails.companyEmail} disabled />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="companyName" value={employerDetails.companyName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Company Phone</label>
              <input type="text" name="companyPhone" value={employerDetails.companyPhone} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Company Address</label>
              <textarea name="companyAddress" value={employerDetails.companyAddress || ''} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-group">
              <label>Company Description</label>
              <textarea name="companyDescription" value={employerDetails.companyDescription || ''} onChange={handleInputChange}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmployerProfile;
