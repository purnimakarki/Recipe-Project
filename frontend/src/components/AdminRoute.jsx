import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function AdminRoute({ children }) {
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();

  if (!userInfo || !userInfo.isAdmin) {
    // Redirect to home page or any other page if user is not an admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render children if user is an admin
  return children;
}

export default AdminRoute;
