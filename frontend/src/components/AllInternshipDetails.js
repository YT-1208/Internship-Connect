import React from 'react';
import './AllInternshipDetails.css'; // Import custom CSS

const AllInternshipDetails = ({ internship, onClose }) => {

  const formatBulletPoints = (text) => {
    if (!text) return null;
    return (
      <ul>
        {text.split(/\r?\n/).map((item, index) => (
          item.trim() !== '' ? <li key={index}>{item.trim()}</li> : null
        ))}
      </ul>
    );
  };

  if (!internship) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{internship.title}</h2>
          <button onClick={onClose} className="close-button">X</button>
        </div>
        <div className="modal-body">
          <div className="details-header">
            {internship.profileImage && (
              <img src={internship.profileImage} alt={`${internship.companyName} Profile`} className="company-profile-img-details" />
            )}
            <h3 className="company-name">{internship.companyName}</h3>
            {internship.companyDescription && (
              <p className="company-description">{internship.companyDescription}</p>
            )}
            {internship.companyAddress && (
              <p className="company-location">Company Location: {internship.companyAddress}</p>
            )}
            <h3 className="internship-location">Internship Location: {internship.area || 'Not specified'}</h3>
            <h3 className="salary">Salary: {internship.salary}</h3>
          </div>
          <div className="details-section">
            <h2>Description</h2>
            {formatBulletPoints(internship.description)}
          </div>

          <div className="details-section">
            <h2>Requirements</h2>
            {formatBulletPoints(internship.requirements)}
          </div>

          <div className="details-section">
            <h2>Eligibility Criteria</h2>
            {formatBulletPoints(internship.eligibilityCriteria)}
          </div>

          <div className="details-section">
            <h2>Status</h2>
            <p className={`status ${internship.status.toLowerCase()}`}>{internship.status}</p>
          </div>

          <div className="details-section">
            <h2>Posted On</h2>
            <p>{new Date(internship.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="details-section">
            <h2>Expires On</h2>
            <p>{internship.expiryDate ? new Date(internship.expiryDate).toLocaleDateString() : 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllInternshipDetails;
