import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const hasAccess = () => {
      switch (requiredRole) {
        case 'admin':
          return user.role === 'admin';
        case 'organizer':
          return user.role === 'organizer' || user.role === 'admin';
        case 'subscriber':
          return user.role === 'subscriber' || user.role === 'organizer' || user.role === 'admin';
        default:
          return true;
      }
    };

    if (!hasAccess()) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

