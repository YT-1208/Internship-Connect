import React from 'react';
import './StudentDetailsModal.css';

const StudentDetailsModal = ({ student, onClose }) => {
  if (!student) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Student Details</h2>
        <div className="student-details">
          <p><strong>Name:</strong> {student.fullName || 'N/A'}</p>
          <p><strong>Matric ID:</strong> {student.matricNo || 'N/A'}</p>
          <p><strong>Email:</strong> {student.email || 'N/A'}</p>
          <p><strong>Programme:</strong> {student.program || 'N/A'}</p>
          <p><strong>Contact Number:</strong> {student.contactNumber || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;