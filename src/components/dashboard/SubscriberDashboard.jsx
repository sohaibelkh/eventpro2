import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Event,
  Person,
  Settings,
  Notifications,
  TrendingUp,
  LocationOn,
  Schedule,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getUserRegistrations, getUpcomingEvents } from '../../utils/mockData';
import EventCard from '../events/EventCard';

const SubscriberDashboard = () => {
  const { user } = useAuth();
  const [organizerRequestDialog, setOrganizerRequestDialog] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const userRegistrations = getUserRegistrations(user.id);
  const upcomingEvents = getUpcomingEvents().slice(0, 3);

  const stats = [
    { icon: <Event />, label: 'Events Registered', value: userRegistrations.length },
    { icon: <TrendingUp />, label: 'Events Attended', value: userRegistrations.filter(e => e.status === 'past').length },
    { icon: <Notifications />, label: 'Upcoming Events', value: userRegistrations.filter(e => e.status === 'upcoming').length }
  ];

  const handleOrganizerRequest = () => {
    setRequestSubmitted(true);
    setOrganizerRequestDialog(false);
    // In a real app, this would make an API call
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your event registrations and discover new events
        </Typography>
      </Box>

      {/* Organizer Request Alert */}
      {requestSubmitted && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your request to become an organizer has been submitted and is under review.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 1 }}>
                {stat.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* My Registrations */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              My Event Registrations
            </Typography>
            
            {userRegistrations.length > 0 ? (
              <List>
                {userRegistrations.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Event color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{event.title}</Typography>
                            <Chip 
                              label={event.status} 
                              size="small" 
                              color={event.status === 'upcoming' ? 'success' : 'default'} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, mr: 1 }} />
                              <Typography variant="body2">
                                {formatDate(event.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        href={`/events/${event.id}`}
                      >
                        View Details
                      </Button>
                    </ListItem>
                    {index < userRegistrations.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                You haven't registered for any events yet. Browse our events to get started!
              </Alert>
            )}
          </Paper>

          {/* Recommended Events */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Recommended Events
            </Typography>
            <Grid container spacing={2}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} key={event.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {event.title}
                        </Typography>
                        <Chip label={event.category} size="small" color="primary" variant="outlined" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {event.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">{formatDate(event.date)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {event.price === 0 ? 'Free' : `$${event.price}`}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" href={`/events/${event.id}`}>
                        View Details
                      </Button>
                      <Button size="small" variant="contained">
                        Register
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column - Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Event />}
                href="/events"
                fullWidth
              >
                Browse Events
              </Button>
              <Button
                variant="outlined"
                startIcon={<Person />}
                href="/profile"
                fullWidth
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => setOrganizerRequestDialog(true)}
                fullWidth
                disabled={requestSubmitted}
              >
                {requestSubmitted ? 'Request Submitted' : 'Become Organizer'}
              </Button>
            </Box>
          </Paper>

          {/* Account Info */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {user.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2">
                <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Typography>
              <Typography variant="body2">
                <strong>Member since:</strong> June 2024
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Organizer Request Dialog */}
      <Dialog open={organizerRequestDialog} onClose={() => setOrganizerRequestDialog(false)}>
        <DialogTitle>Request to Become an Organizer</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Would you like to request organizer privileges? This will allow you to create and manage your own events.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your request will be reviewed by our admin team and you'll be notified of the decision.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrganizerRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleOrganizerRequest} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriberDashboard;

