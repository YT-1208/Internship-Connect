import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

// Configure axios base URL and headers
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const Login = () => {
  // State management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [googleCredential, setGoogleCredential] = useState(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Clear error when role changes
  useEffect(() => {
    setError('');
  }, [role]);

  // Handle Google login success
  const handleGoogleSuccess = (response) => {
    console.log("Google credential received");
    setGoogleCredential(response.credential);
    setShowRoleSelect(true);
    setError('');
  };

  // Handle Google login error
  const handleGoogleError = (error) => {
    console.error("Google button error:", error);
    setError("Failed to connect to Google. Check your network.");
  };

  // Handle Google login with role submission
  const handleGoogleRoleSubmit = async () => {
    if (!role) {
      setError("Please select your role");
      return;
    }

    try {
      const res = await axios.post('/api/auth/google-login', { credential: googleCredential, role });
      const { token, user, needsRegistration, email } = res.data;

      if (needsRegistration) {
        const registrationState = {
          googleCredential,
          role,
          email
        };

        switch(role) {
          case 'student':
            navigate('/student-registration', { state: registrationState });
            break;
          case 'system admin':
            navigate('/admin-subscription', { state: registrationState });
            break;
          case 'employer':
            navigate('/employer-registration', { state: registrationState });
            break;
          default:
            navigate('/select-role');
        }
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        switch(role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'system admin':
            navigate('/admin/dashboard');
            break;
          case 'employer':
            navigate('/employer/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Google login failed. Please try again.");
    }
  };

  // Handle regular login submission
  const handleRegularLogin = async (e) => {
    e.preventDefault();
    
    // Validate input fields
    if (!username || !password || !role) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post('/api/auth/login', { username, password, role });
      const { token, user } = res.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Role-based redirect for regular login
      switch(role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'system admin':
          navigate('/admin/dashboard');
          break;
        case 'employer':
          navigate('/employer/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError(err.response?.data?.msg || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Regular Login Form */}
        <div className="login-form">
          <h2>Login</h2>
          <p>Welcome back! Please login to your account</p>
          
          {/* Error message display */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={(e) => { console.log('Form onSubmit triggered'); handleRegularLogin(e); }} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group password-container">
              <label>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
              <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Choose your role</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
                <option value="system admin">System Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="login-button">Login</button>
            </div>
          </form>

          {/* Google SSO Option */}
          <div className="login-options">
            <span>or login with Google</span>
          </div>
          
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText="Continue with Google"
            className="google-login-button"
          />
          {/* Role Selection for Google Login */}
          {showRoleSelect && (
            <div className="role-selection">
              <h3>Select Your Role</h3>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="">Choose your role</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
                <option value="system admin">System Admin</option>
              </select>
              <button 
                onClick={handleGoogleRoleSubmit} 
                className="login-button"
                style={{ marginTop: '10px' }}
              >
                Continue
              </button>
            </div>
          )}
          {/* Register Link (now links to RoleSelection) */}
          <div className="register-link">
            Don't have an account? <a href="/select-role" onClick={() => localStorage.removeItem('user')}>Register here</a>
          </div>
        </div>

        {/* Login Illustration */}
        <div className="login-image">
          <img src={process.env.PUBLIC_URL + "/assets/login_illustration.png"} alt="Login illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;