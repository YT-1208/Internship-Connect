import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './GenerateStudentReport.css';
import './Button.css';

// Report Generation Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const GenerateStudentReport = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportFormat, setReportFormat] = useState('pdf');
    const [universityName, setUniversityName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.user_id) {
                navigate('/login');
                return;
            }

            try {
                const adminResponse = await fetch(`http://localhost:5000/api/admin/${user.user_id}`);
                const adminData = await adminResponse.json();

                if (!adminData.success || !adminData.data.university_id) {
                    setError('Could not retrieve university ID for the admin.');
                    setLoading(false);
                    return;
                }
                
                setUniversityName(adminData.data.universityName || 'University');
                const universityId = adminData.data.university_id;

                const studentsResponse = await fetch(`http://localhost:5000/api/admin/students/${universityId}`);
                const studentsData = await studentsResponse.json();

                if (studentsData.success) {
                    setStudents(studentsData.data);
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

        fetchData();
    }, [navigate]);

    const handleGenerateReport = () => {
        if (students.length === 0) {
            alert('No student data available to generate a report.');
            return;
        }

        const headers = ['Name', 'Matric ID', 'Programme', 'Email', 'Status'];
        const data = students.map(student => [
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
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.text(`Student Report - ${universityName}`, 14, 15);
        autoTable(doc, {
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
                    new Paragraph({ text: `Student Report - ${universityName}`, heading: 'Heading1' }),
                    table,
                ],
            }],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'student-report.docx');
        });
    };

    return (
        <div className="generate-report-page">
            <Navbar />
            <div className="generate-report-container">
                <h2>Generate Student Report</h2>
                <p>Select the desired file format and click the button to download a report of all students.</p>
                
                {loading && <div className="loading-container">Loading student data...</div>}
                {error && <div className="error-container">Error: {error}</div>}

                {!loading && !error && (
                    <div className="report-controls">
                        <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)}>
                            <option value="pdf">PDF</option>
                            <option value="word">Word (.docx)</option>
                        </select>
                        <button onClick={handleGenerateReport} className="btn btn-primary">
                            Generate & Download
                        </button>
                    </div>
                )}
                 <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{marginTop: '20px'}}>
                    Back to Manage Students
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default GenerateStudentReport;
