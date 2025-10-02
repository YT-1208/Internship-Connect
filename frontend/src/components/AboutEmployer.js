import React from 'react';
import './About.css';
import Footer from './Footer';
import EmployerNavbar from './EmployerNavbar';

const AboutEmployer = () => {
  return (
    <div className="about-page">
      <EmployerNavbar />
      <div className="about-container">
        <img src="/assets/internshipconnect_logo.png" alt="Internship Connect Logo" className="about-logo" />
        <h1>About Internship Connect</h1>
        
        <section className="about-section">
          <h2>Introduction</h2>
          <p>
            Welcome to Internship Connect, the premier platform dedicated to bridging the gap between ambitious university students and the professional world. In today's competitive landscape, securing a meaningful internship is more crucial than ever. It's not just about fulfilling academic requirements; it's about gaining practical experience, developing new skills, and building a network that will launch your career. However, the search for the right opportunity can be overwhelming and fraught with uncertainty. That's where Internship Connect comes in.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Purpose</h2>
          <p>
            Our core mission is to empower students by providing a centralized, reliable, and transparent platform to find trustworthy internship opportunities. We understand that industrial training is a vital component of your education. Therefore, we are committed to ensuring that every listing on our platform is from a verified and reputable company. We aim to eliminate the stress and insecurity of the internship hunt, allowing you to focus on what truly matters: finding a role that aligns with your passions, enhances your skills, and sets you on a path to success.
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="how-it-works-container">
            <div className="how-it-works-card">
              <h3>For Students</h3>
              <ol>
                <li><strong>Create Your Profile:</strong> Sign up and build a comprehensive profile that showcases your skills, experience, and academic achievements.</li>
                <li><strong>Browse Opportunities:</strong> Explore a wide range of internship listings from top companies across various industries.</li>
                <li><strong>Apply with Confidence:</strong> Submit your application directly through our platform, knowing that every opportunity is verified.</li>
                <li><strong>Track Your Progress:</strong> Keep track of your applications and receive updates from potential employers.</li>
              </ol>
            </div>
            <div className="how-it-works-card">
              <h3>For Employers</h3>
              <ol>
                <li><strong>Register Your Company:</strong> Create an employer account to get started.</li>
                <li><strong>Post Internships:</strong> Easily post internship opportunities and specify the required skills and qualifications.</li>
                <li><strong>Review Applications:</strong> Access a streamlined dashboard to review applications and manage candidates.</li>
                <li><strong>Find Talent:</strong> Connect with the best and brightest students to build your team.</li>
              </ol>
            </div>
            <div className="how-it-works-card">
              <h3>For System Admins</h3>
              <ol>
                <li><strong>Platform Management:</strong> System Administrators log in with provided credentials.</li>
                <li><strong>Oversee Content:</strong> Manage university, employer, and student listings to ensure quality and compliance.</li>
                <li><strong>Ensure Smooth Operation:</strong> Monitor the platform to maintain a reliable and trustworthy environment for all users.</li>
                <li><strong>Support and Verification:</strong> Handle verification processes and provide support to platform users.</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutEmployer;
