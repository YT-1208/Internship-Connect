import React from 'react';
import './EmployerDetailsModal.css';

const EmployerDetailsModal = ({ employer, onClose }) => {
  if (!employer) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Employer Details</h2>
        <div className="employer-details">
          {employer.profileImage && (
            <img src={employer.profileImage} alt={`${employer.companyName} Profile`} className="employer-profile-image" />
          )}
          <p><strong>Company Name:</strong> {employer.companyName || 'N/A'}</p>
          <p><strong>Email:</strong> {employer.email || 'N/A'}</p>
          <p><strong>Contact Number:</strong> {employer.companyPhone || 'N/A'}</p>
          <p><strong>Address:</strong> {employer.companyAddress || 'N/A'}</p>
          <p><strong>Description:</strong> {employer.companyDescription || 'N/A'}</p>
          <p><strong>Verified:</strong> {employer.is_verified ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployerDetailsModal;