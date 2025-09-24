import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SystemAdminProfile.css';
import Footer from './Footer'; // Import the Footer component
import './Button.css'; // Import the new button styles

const SystemAdminProfile = () => {
  const navigate = useNavigate();
  const [adminDetails, setAdminDetails] = useState({
    university_id: '',
    universityName: '',
    contactEmail: '',
    position: '',
    faculty: '',
    phoneNumber: '',
    address: '',
    description: '' // Add description field
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token'); // Get token from localStorage

        if (user && user.user_id && token) {
          const response = await fetch(`http://localhost:5000/api/admin/${user.user_id}`, {
            headers: {
              'Authorization': `Bearer ${token}` // Add Authorization header
            }
          });
          const data = await response.json();
          if (data.success) {
            setAdminDetails(data.data);
            if (data.data.profileImage) {
              setPreviewImage(data.data.profileImage);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admin details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminDetails(prevState => ({
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
    if (user && user.user_id) {
      const formData = new FormData();
      formData.append('position', adminDetails.position);
      formData.append('faculty', adminDetails.faculty);
      formData.append('phoneNumber', adminDetails.phoneNumber);
      formData.append('address', adminDetails.address);
      formData.append('description', adminDetails.description);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      try {
        const token = localStorage.getItem('token'); // Get token
        const response = await fetch(`http://localhost:5000/api/admin/${user.user_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}` // Add Authorization header
          },
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
      <div className="profile-container">
        <div className="profile-form">
          <button onClick={() => navigate('/admin/dashboard')} className="btn btn-primary">Back</button>
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group profile-image-section">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && <img src={previewImage} alt="Profile Preview" className="profile-preview"/>}
            </div>
            
            <div className="form-group">
              <label>University ID</label>
              <input
                type="text"
                name="university_id"
                value={adminDetails.university_id}
                disabled
              />
            </div>
            <div className="form-group">
              <label>University Name</label>
              <input
                type="text"
                name="universityName"
                value={adminDetails.universityName}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="contactEmail"
                value={adminDetails.contactEmail}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Position</label>
              <input
                type="text"
                name="position"
                value={adminDetails.position}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Faculty</label>
              <input
                type="text"
                name="faculty"
                value={adminDetails.faculty}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={adminDetails.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>University Address</label>
              <textarea
                name="address"
                value={adminDetails.address}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label>University Description</label>
              <textarea
                name="description"
                value={adminDetails.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SystemAdminProfile;
