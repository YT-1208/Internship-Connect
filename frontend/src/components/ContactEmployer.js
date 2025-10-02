import React, { useState, useEffect } from 'react';
import './Contact.css';
import EmployerNavbar from './EmployerNavbar';
import Footer from './Footer';

const ContactEmployer = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (user && user.user_id && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/employers/${user.user_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setUserName(data.data.companyName);
            setUserEmail(data.data.companyEmail);
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName, email: userEmail, message }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Done Submission');
        setMessage('');
      } else {
        alert(data.message || 'Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred while sending your message.');
    }
  };

  return (
    <div className="contact-page">
      <EmployerNavbar />
      <div className="contact-container">
        <img src="/assets/internshipconnect_logo.png" alt="Internship Connect Logo" className="contact-logo" />
        <h1>Contact Us</h1>
        <p className="contact-intro">
          Have questions or need assistance? We're here to help! Check out our FAQ section below for answers to common questions. If you can't find what you're looking for, feel free to send us a message using the contact form.
        </p>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item">
            <h4>How do I reset my password?</h4>
            <p>You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.</p>
          </div>
          <div className="faq-item">
            <h4>How do I update my profile information?</h4>
            <p>Navigate to the "Profile" page from the user dropdown menu in the navigation bar. There, you can edit your details and save the changes.</p>
          </div>
          <div className="faq-item">
            <h4>How long does a subscription last?</h4>
            <p>A standard subscription lasts for one year from the date of payment. You will be notified before your subscription expires.</p>
          </div>
          <div className="faq-item">
            <h4>What types of internships are available?</h4>
            <p>We feature internships across a wide range of industries, including tech, marketing, finance, and more. All opportunities are from verified companies to ensure a safe and valuable experience.</p>
          </div>
          <div className="faq-item">
            <h4>Is Internship Connect free for students?</h4>
            <p>Yes, our platform is completely free for students to use. You can create a profile, browse internships, and apply for opportunities at no cost.</p>
          </div>
        </section>

        <section className="contact-form-section">
          <h2>Bug Report or Any Queries</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={userName} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={userEmail} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="6" value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ContactEmployer;
