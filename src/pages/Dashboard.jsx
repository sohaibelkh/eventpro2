import React from 'react';
import { useAuth } from '../hooks/useAuth';
import SubscriberDashboard from '../components/dashboard/SubscriberDashboard';
import OrganizerDashboard from '../components/dashboard/OrganizerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import { Container, Typography, Alert } from '@mui/material';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          You must be logged in to access the dashboard.
        </Alert>
      </Container>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'organizer':
        return <OrganizerDashboard />;
      case 'subscriber':
        return <SubscriberDashboard />;
      default:
        return (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Alert severity="warning">
              Unknown user role. Please contact support.
            </Alert>
          </Container>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;

