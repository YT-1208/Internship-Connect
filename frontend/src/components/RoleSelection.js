import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role); // Store role for later verification
    
    switch(role) {
      case 'student':
        navigate('/student-registration'); // Direct to student registration
        break;
      case 'system admin':
        navigate('/admin-subscription'); // Admin first goes to subscription
        break;
      case 'employer':
        navigate('/employer-registration'); // Direct to employer registration
        break;
      default:
        alert('Please select a valid role');
    }
  };

  return (
    <div className="role-selection-container">
      <h2>Select Your Role</h2>
      <div className="role-buttons">
        <button 
          className="role-btn" 
          onClick={() => handleRoleSelect('student')}
        >
          Student
        </button>

        <button 
          className="role-btn" 
          onClick={() => handleRoleSelect('system admin')}
        >
          System Admin
        </button>

        <button 
          className="role-btn" 
          onClick={() => handleRoleSelect('employer')}
        >
          Employer
        </button>
      </div>
      <button onClick={() => navigate('/login')} className="back-button">Back to Login</button>
    </div>
  );
};

export default RoleSelection;