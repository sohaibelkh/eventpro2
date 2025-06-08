import React from 'react';
import { Container, Typography } from '@mui/material';

const Admin = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Typography variant="body1">
        Admin management interface will be here...
      </Typography>
    </Container>
  );
};

export default Admin;

