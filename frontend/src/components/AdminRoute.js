import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';

const AdminRoute = ({ children }) => {
    const { currentUser, loading, isAdmin } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center p-5">Loading...</div>;
    }

    if (!currentUser || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute; 