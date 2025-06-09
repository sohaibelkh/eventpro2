import React, { useState, useEffect } from 'react';
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
  Divider,
  CircularProgress, // Added for loading state
  IconButton,
} from '@mui/material';
import {
  Event,
  Add,
  Edit,
  Delete,
  People,
  TrendingUp,
  Visibility, // Kept for View Details button icon
  LocationOn,
  Schedule,
  AttachMoney
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../utils/apiService'; // Import apiService

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) {
        setLoadingEvents(false);
        return;
      }
      try {
        setLoadingEvents(true);
        setError('');
        // Assuming apiService.getOrganizerEvents(userId) exists or similar
        // If you have a general getEvents and filter by organizerId, adjust accordingly
        const events = await apiService.getUserEvents(user.id); 
        setOrganizerEvents(events);
      } catch (err) {
        setError(err.message || 'Failed to load your events. Please try again.');
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [user?.id]);

  const upcomingEvents = organizerEvents.filter(e => e.status === 'upcoming');
  const pastEvents = organizerEvents.filter(e => e.status === 'past');

  const stats = [
    { icon: <Event />, label: 'Total Events', value: organizerEvents.length },
    { icon: <TrendingUp />, label: 'Upcoming Events', value: upcomingEvents.length },
    { icon: <People />, label: 'Total Participants', value: organizerEvents.reduce((sum, e) => sum + e.currentParticipants, 0) }
  ];

  const handleDeleteEvent = (eventData) => {
    setSelectedEvent(eventData);
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await apiService.deleteEvent(selectedEvent.id);
      setOrganizerEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));
      setDeleteDialog(false);
      setSelectedEvent(null);
      // Optionally, show a success message (e.g., using a Snackbar)
    } catch (err) {
      console.error("Failed to delete event:", err);
      // Display error to user, perhaps in the dialog or an Alert
      setError(err.message || 'Failed to delete event. Please try again.');
      // Keep dialog open or handle error display appropriately
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Organizer Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your events and track participant engagement
        </Typography>
        {error && !loadingEvents && ( // Show general error if not loading
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Box>

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
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                Quick Actions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/events/create"
                size="large"
              >
                Create New Event
              </Button>
              <Button
                variant="outlined"
                startIcon={<Event />}
                href="/events"
                size="large"
              >
                Browse All Events
              </Button>
            </Box>
          </Paper>

          {/* My Events */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              My Events
            </Typography>
            
            {loadingEvents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading your events...</Typography>
              </Box>
            ) : error && organizerEvents.length === 0 ? ( // Show error specific to event loading if no events
              <Alert severity="warning">Could not load your events. {error.includes("Failed to load") ? error : "Please try refreshing."}</Alert>
            )
            : organizerEvents.length > 0 ? (
              <Grid container spacing={2}>
                {organizerEvents.map((event) => (
                  <Grid item xs={12} key={event.id}>
                    <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" component="h3">
                                {event.title}
                              </Typography>
                              <Chip 
                                label={event.status} 
                                size="small" 
                                color={event.status === 'upcoming' ? 'success' : 'default'} 
                              />
                              <Chip 
                                label={event.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {event.description.substring(0, 120)}...
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ mb: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Schedule sx={{ fontSize: 16, mr: 1 }} />
                                  <Typography variant="body2">
                                    {formatDate(event.date)} at {formatTime(event.time)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                                  <Typography variant="body2">
                                    {event.location}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <People sx={{ fontSize: 16, mr: 1 }} />
                                  <Typography variant="body2">
                                    {event.currentParticipants}/{event.maxParticipants} participants
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AttachMoney sx={{ fontSize: 16, mr: 1 }} />
                                  <Typography variant="body2">
                                    {event.price === 0 ? 'Free' : `$${event.price}`}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button size="small" startIcon={<Visibility />} href={`/events/${event.id}`}>
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<Delete />} 
                          color="error"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          Delete Event
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                You haven't created any events yet. Click "Create New Event" to get started!
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Event Statistics */}
        <Grid item xs={12} md={4}>
          {/* Performance Summary */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Performance Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Event Capacity
                </Typography>
                <Typography variant="h6" color="primary">
                  85%
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h6" color="success.main">
                  $12,450
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Participant Satisfaction
                </Typography>
                <Typography variant="h6" color="warning.main">
                  4.8/5.0
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizerDashboard;
