import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ManageStudents.css';
import './Button.css';
import StudentDetailsModal from './StudentDetailsModal';

// Report Generation Imports
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';


const ManageStudents = () => {
  const navigate = useNavigate();
  const [universityDetails, setUniversityDetails] = useState(null);

  const [pendingStudents, setPendingStudents] = useState([]);
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf'); // 'pdf' or 'word'

  useEffect(() => {
    const fetchManageStudentsData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !user.user_id || !token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      try {
        const adminResponse = await fetch(`http://localhost:5000/api/admin/${user.user_id}`, { headers });
        const adminData = await adminResponse.json();

        if (!adminData.success || !adminData.data.university_id) {
          setError('Could not retrieve university ID for the admin.');
          setLoading(false);
          return;
        }

        setAdminDetails(adminData.data);
        if (adminData.data.profileImage) {
          setPreviewImage(adminData.data.profileImage);
        }

        const universityId = adminData.data.university_id;

        const uniResponse = await fetch(`http://localhost:5000/api/admin/university/${universityId}`, { headers });
        const uniData = await uniResponse.json();

        if (uniData.success) {
          setUniversityDetails(uniData.data);
        } else {
          setError(uniData.message || 'Failed to fetch university details.');
        }

        const studentsResponse = await fetch(`http://localhost:5000/api/admin/students/${universityId}`, { headers });
        const studentsData = await studentsResponse.json();

        if (studentsData.success) {
          setVerifiedStudents(studentsData.data.filter(student => student.is_verified));
          setPendingStudents(studentsData.data.filter(student => !student.is_verified));
        } else {
          setError(studentsData.message || 'Failed to fetch students.');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchManageStudentsData();
  }, [navigate]);

  const handleGenerateReport = () => {
    const allStudents = [...pendingStudents, ...verifiedStudents];
    if (allStudents.length === 0) {
      alert('No student data available to generate a report.');
      return;
    }

    const headers = ['Name', 'Matric ID', 'Programme', 'Email', 'Status'];
    const data = allStudents.map(student => [
      student.name,
      student.matric_id,
      student.programme,
      student.email,
      student.is_verified ? 'Verified' : 'Pending'
    ]);

    if (reportFormat === 'pdf') {
      generatePdf(headers, data);
    } else {
      generateWord(headers, data);
    }
  };

  const generatePdf = (headers, data) => {
    const doc = new jsPDF();
    doc.text(`Student Report - ${adminDetails?.universityName || 'University'}`, 14, 15);
    doc.autoTable({
      startY: 20,
      head: [headers],
      body: data,
    });
    doc.save('student-report.pdf');
  };

  const generateWord = (headers, data) => {
    const headerRow = new TableRow({
      children: headers.map(header => new TableCell({
        children: [new Paragraph({ text: header, bold: true })],
        width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
      })),
    });

    const dataRows = data.map(row => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph(cell)],
      })),
    }));

    const table = new Table({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `Student Report - ${adminDetails?.universityName || 'University'}`, heading: 'Heading1' }),
          table,
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'student-report.docx');
    });
  };


  const handleVerifyStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to verify this student?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const response = await fetch(`http://localhost:5000/api/admin/student/verify/${studentId}`, {
          method: 'PUT',
          headers
        });
        const data = await response.json();
        if (data.success) {
          alert('Student verified successfully!');
          const verifiedStudent = pendingStudents.find(student => student.student_id === studentId);
          setVerifiedStudents(prevVerified => [...prevVerified, { ...verifiedStudent, is_verified: 1 }]);
          setPendingStudents(prevPending => prevPending.filter(student => student.student_id !== studentId));
          const notificationResponse = await fetch(`http://localhost:5000/api/admin/student/verify/notify/${studentId}`, {
            method: 'GET',
            headers
          });
          console.log('Notification response:', await notificationResponse.json());
        } else {
          alert(data.message || 'Failed to verify student.');
        }
      } catch (err) {
        console.error('Error verifying student:', err);
        alert('An error occurred while verifying the student.');
      }
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const notificationResponse = await fetch(`http://localhost:5000/api/admin/student/remove/notify/${studentId}`, {
          method: 'GET',
          headers
        });
        console.log('Notification response:', await notificationResponse.json());

        const response = await fetch(`http://localhost:5000/api/admin/student/remove/${studentId}`, {
          method: 'DELETE',
          headers
        });
        const data = await response.json();
        if (data.success) {
          alert('Student removed successfully!');
          setPendingStudents(prevPending => prevPending.filter(student => student.student_id !== studentId));
          setVerifiedStudents(prevVerified => prevVerified.filter(student => student.student_id !== studentId));
        } else {
          alert(data.message || 'Failed to remove student.');
        }
      } catch (err) {
        console.error('Error removing student:', err);
        alert('An error occurred while removing the student.');
      }
    }
  };

  const handleViewStudent = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${studentId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedStudent(data.data);
        setIsModalOpen(true);
      } else {
        alert(data.message || 'Failed to fetch student details.');
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      alert('An error occurred while fetching student details.');
    }
  };

  if (loading) {
    return (
      <div className="manage-students-page">
        <Navbar />
        <div className="loading-container">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-students-page">
        <Navbar />
        <div className="error-container">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="manage-students-page">
      <Navbar />
      <div className="manage-students-container">
        {universityDetails && (
          <div className="university-intro">
            {previewImage && (
              <img src={previewImage} alt={`${adminDetails.universityName} Logo`} className="university-logo" />
            )}
            <h2>{adminDetails.universityName}</h2>
            {adminDetails && adminDetails.description ? (
              <p>{adminDetails.description}</p>
            ) : (
              <p>No Description yet, Please Proceed to Profile Page for filling in.</p>
            )}
          </div>
        )}

        <div className="students-list-section">
          <h3>Pending Students Verification</h3>
          {pendingStudents.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Matric ID</th>
                  <th>Programme</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.name}</td>
                    <td>{student.matric_id}</td>
                    <td>{student.programme}</td>
                    <td>
                      <button
                        onClick={() => handleVerifyStudent(student.student_id)}
                        className="btn btn-primary verify-btn"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student.student_id)}
                        className="btn btn-primary remove-btn"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students pending for verification.</p>
          )}
        </div>
        <div className="students-list-section">
          <h3>Verified Students</h3>
          {verifiedStudents.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Matric ID</th>
                  <th>Programme</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiedStudents.map(student => (
                  <tr key={student.student_id}>
                    <td>{student.name}</td>
                    <td>{student.matric_id}</td>
                    <td>{student.programme}</td>
                    <td>
                      <button
                        onClick={() => handleViewStudent(student.student_id)}
                        className="btn btn-primary view-btn"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student.student_id)}
                        className="btn btn-primary remove-btn"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students have been verified yet.</p>
          )}
        </div>
        <div className="generate-report-button-container">
            <button onClick={() => navigate('/admin/generate-student-report')} className="btn btn-primary">
                Generate Student Report
            </button>
        </div>
      </div>
      <Footer />
      {isModalOpen && <StudentDetailsModal student={selectedStudent} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ManageStudents;