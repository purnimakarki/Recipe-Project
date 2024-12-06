import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { userInfo, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Optionally render a loading spinner or message
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userInfo.isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
