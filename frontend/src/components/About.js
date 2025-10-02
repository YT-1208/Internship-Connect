import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user ? user.role : 'guest';

    if (role === 'employer') {
      navigate('/employer/about');
    } else {
      navigate('/admin/about');
    }
  }, [navigate]);

  return null; // This component will redirect, so it doesn't need to render anything
};

export default About;
