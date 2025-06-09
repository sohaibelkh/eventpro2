import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Person,
  AttachMoney,
  Share,
  Bookmark,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import apiService from '../utils/apiService';  // <- import your ApiService instance

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userIsRegistered, setUserIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await apiService.getEvent(id);
        setEvent(eventData);

        if (user) {
          // Check if user is registered for the event
          const isRegistered = await apiService.getUserRegistrations(user.id);
          const registeredForEvent = isRegistered.some(reg => reg.id === parseInt(id));
          setUserIsRegistered(registeredForEvent);
        }
      } catch (err) {
        setError('Failed to load event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleRegister = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setRegistrationDialog(true);
  };

  const confirmRegistration = async () => {
    try {
      // Call API to subscribe
      await apiService.subscribeToEvent(id);
      setRegistered(true);
      setUserIsRegistered(true);
      setRegistrationDialog(false);
    } catch (err) {
      alert('Registration failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/events')}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Event not found. Please check the URL or go back to the events list.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/events')}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const isEventPast = event.status === 'past';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/events')}
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Event Image */}
          <Box
            component="img"
            src={event.image}
            alt={event.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 3,
            }}
          />

          {/* Event Title and Basic Info */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={event.category} color="primary" />
              <Chip
                label={event.status}
                color={event.status === 'upcoming' ? 'success' : 'default'}
              />
              {event.price === 0 && <Chip label="Free" color="secondary" />}
            </Box>

            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              {event.title}
            </Typography>

            <Typography variant="h6" color="text.secondary" paragraph>
              {event.description}
            </Typography>
          </Box>

          {/* Event Details */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Event Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {formatDate(event.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(event.time)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {event.location}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {event.currentParticipants}/{event.maxParticipants} Participants
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.maxParticipants - event.currentParticipants} spots remaining
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {event.price === 0 ? 'Free Event' : `$${event.price}`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {event.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Registration Card */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {event.price === 0 ? 'Free Event' : `$${event.price}`}
            </Typography>

            {userIsRegistered ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                You are registered for this event!
              </Alert>
            ) : isEventPast ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                This event has already ended.
              </Alert>
            ) : isEventFull ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This event is fully booked.
              </Alert>
            ) : null}

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleRegister}
              disabled={userIsRegistered || isEventPast || isEventFull}
              sx={{ mb: 2 }}
            >
              {userIsRegistered
                ? 'Already Registered'
                : isEventPast
                ? 'Event Ended'
                : isEventFull
                ? 'Event Full'
                : 'Register Now'}
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Share />} size="small" fullWidth>
                Share
              </Button>
              <Button variant="outlined" startIcon={<Bookmark />} size="small" fullWidth>
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Registration Confirmation Dialog */}
      <Dialog
        open={registrationDialog}
        onClose={() => setRegistrationDialog(false)}
      >
        <DialogTitle>Confirm Registration</DialogTitle>
        <DialogContent>
          Are you sure you want to register for <strong>{event.title}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialog(false)}>Cancel</Button>
          <Button onClick={confirmRegistration} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetail;
