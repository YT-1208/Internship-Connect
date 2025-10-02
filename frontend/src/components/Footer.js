import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user ? user.role : 'guest';

  const aboutLink = role === 'employer' ? '/employer/about' : '/admin/about';
  const contactLink = role === 'employer' ? '/employer/contact' : '/admin/contact';

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h4>INTERNSHIP CONNECT</h4>
          <p>Call now: +60 12345 678</p>
          <p>No 227, Jalan Raja Permaisuri</p>
          <p>Batun, 30250 Ipoh, Perak</p>
        </div>
        <div className="footer-links">
          <h4>Quick Link</h4>
                      <Link to={aboutLink} className="footer-link">About</Link>
                      <Link to={contactLink} className="footer-link">Contact</Link>        </div>
        <div className="footer-logo">
          <img 
            src="/assets/internshipconnect_footer.png" 
            alt="Internship Connect Footer Logo" 
            className="footer-logo-img" 
          />
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Internship Connect - All rights Reserved</p>
        <div className="social-icons">
          <a href="https://www.facebook.com" className="social-icon">
            <img src="/assets/facebook_logo.png" alt="Facebook" />
          </a>
          <a href="https://www.youtube.com" className="social-icon">
            <img src="/assets/youtube_logo.png" alt="YouTube" />
          </a>
          <a href="https://www.instagram.com" className="social-icon">
            <img src="/assets/Instagram-Icon.png" alt="Instagram" />
          </a>
          <a href="https://www.twitter.com" className="social-icon">
            <img src="/assets/x_logo.png" alt="Twitter" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
