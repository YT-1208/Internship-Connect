import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const EmployerRoute = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // If the user is authenticated and has the role of 'employer', render the child routes.
    // Otherwise, navigate to the login page.
    return token && user?.role === 'employer' ? <Outlet /> : <Navigate to="/login" />;
};

export default EmployerRoute;
