import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="text-center p-5">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute; 