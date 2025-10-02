import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import StudentRegistration from './components/StudentRegistration';
import Subscription from './components/Subscription';
import PaymentPage from './components/PaymentPage';
import AdminRegistration from './components/AdminRegistration';
import SystemAdminHome from './components/SystemAdminHome';
import SystemAdminProfile from './components/SystemAdminProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import About from './components/About'; // Import the About component
import Contact from './components/Contact'; // Import the Contact component
import ManageStudents from './components/ManageStudents'; // Import the ManageStudents component
import GenerateStudentReport from './components/GenerateStudentReport'; // Import the GenerateStudentReport component
import TermsAndConditions from './components/TermsAndConditions'; // Import the TermsAndConditions component
import PrivacyPolicy from './components/PrivacyPolicy'; // Import the PrivacyPolicy component
import EmployerRegistration from './components/EmployerRegistration'; // Import the EmployerRegistration component
import EmployerHome from './components/EmployerHome';
import EmployerProfile from './components/EmployerProfile';
import PostInternship from './components/PostInternship';
import EmployerMyInternship from './components/EmployerMyInternship';
import EmployerEditInternship from './components/EmployerEditInternship';
import EmployerViewApplicant from './components/EmployerViewApplicant';
import EmployerRoute from './components/EmployerRoute';
import AboutSystemAdmin from './components/AboutSystemAdmin';
import ContactSystemAdmin from './components/ContactSystemAdmin';
import AboutEmployer from './components/AboutEmployer';
import ContactEmployer from './components/ContactEmployer';
import AdminViewAllInternships from './components/AdminViewAllInternships';
import ViewEmployers from './components/ViewEmployers';
import SystemAdminSubscription from './components/systemAdminSubscription';
import SuperAdminHome from './components/SuperAdminHome';

function App() {


  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Role Selection (after login for new users) */}
          <Route path="/select-role" element={<RoleSelection />} />

          {/* Student Registration (after selecting "student") */}
          <Route path="/student-registration" element={<StudentRegistration />} />

          {/* Employer Registration (after selecting "employer") */}
          <Route path="/employer-registration" element={<EmployerRegistration />} />

          {/* System Admin Subscription Page (after selecting "systemAdmin") */}
          <Route path="/admin-subscription" element={<Subscription />} />

          {/* Admin Registration (after subscription) */ }
          <Route path="/admin-registration" element={<AdminRegistration />} />

          {/*Payment page */}
          <Route path="/admin-payment" element={<PaymentPage />} />

          {/* System Admin Home Page */}
          <Route path="/admin/dashboard" element={<SystemAdminHome />} />

          {/* System Admin Profile Page */}
          <Route path="/admin/profile" element={<SystemAdminProfile />} />

          {/* System Admin Subscription Page */}
          <Route path="/admin/subscription" element={<SystemAdminSubscription />} />

          {/* Super Admin Home Page */}
          <Route path="/superadmin/home" element={<SuperAdminHome />} />

          {/* Admin View All Internships Page */}
          <Route path="/admin/view-all-internships" element={<AdminViewAllInternships />} />

          {/* Manage Employers Page */}
          <Route path="/admin/view-companies" element={<ViewEmployers />} />

          {/* About Page */}
          <Route path="/about" element={<About />} />
          <Route path="/admin/about" element={<AboutSystemAdmin />} />
          <Route path="/employer/about" element={<AboutEmployer />} />

          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/contact" element={<ContactSystemAdmin />} />
          <Route path="/employer/contact" element={<ContactEmployer />} />

          {/* Manage Students Page */}
          <Route path="/admin/manage-students" element={<ManageStudents />} />

          {/* Generate Student Report Page */}
          <Route path="/admin/generate-student-report" element={<GenerateStudentReport />} />

          {/* Employer Routes */}
          <Route path='/employer' element={<EmployerRoute />}>
            <Route path='dashboard' element={<EmployerHome />} />
            <Route path='profile' element={<EmployerProfile />} />
            <Route path='post-internship' element={<PostInternship />} />
            <Route path='my-internship' element={<EmployerMyInternship />} />
            <Route path='edit-internship/:internshipId' element={<EmployerEditInternship />} />
            <Route path='view-applicants/:internshipId' element={<EmployerViewApplicant />} />
          </Route>

          {/* Legal Pages */}
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Forgot Password Page */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Reset Password Page */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Default route (e.g., redirect to login) */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;