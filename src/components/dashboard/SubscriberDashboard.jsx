import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../utils/apiService';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar, // Added Avatar import
} from '@mui/material';
import { EventAvailable, Star, TrendingUp, LocalActivity, Explore } from '@mui/icons-material';

const SubscriberDashboard = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRequestOrganizer = () => {
    // In a real app, this would trigger an API call or a modal to confirm.
    // For now, it's a placeholder.
    alert('Your request to become an organizer has been noted. This feature would typically involve an admin approval process.');
  };

  useEffect(() => {
    if (user && user.id) {
      const fetchRegisteredAndAllEvents = async () => {
        setLoading(true);
        setLoadingRecs(true);
        setError(null);
        try {
          const [userRegs, allEventsResponse] = await Promise.all([
            apiService.getUserRegistrations(user.id),
            apiService.getEvents() // Fetch all events for recommendations
          ]);

          setRegisteredEvents(userRegs);

          // Filter out events user is already registered for and select random ones
          const registeredEventIds = new Set(userRegs.map(e => e.id));
          const availableForRecommendation = allEventsResponse.filter(
            event => !registeredEventIds.has(event.id) && event.status === 'upcoming'
          );

          // Shuffle and pick a few recommendations (e.g., up to 3)
          const shuffled = availableForRecommendation.sort(() => 0.5 - Math.random());
          setRecommendedEvents(shuffled.slice(0, 3));

        } catch (err) {
          console.error('Failed to fetch registered events:', err);
          setError(err.message || 'Could not load your registered events.');
        } finally {
          setLoading(false);
          setLoadingRecs(false);
        }
      };
      fetchRegisteredAndAllEvents();
    } else {
      setLoading(false); // No user, or user.id is not available
      setLoadingRecs(false);
    }
  }, [user]);

  const StatCard = ({ title, value, icon, color = "primary.main" }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
        <Box>
          <Typography variant="h6" component="div">{value}</Typography>
          <Typography color="text.secondary">{title}</Typography>
        </Box>
      </Paper>
    </Grid>
  );

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Loading your events...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          My Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Welcome, {user?.name}! Here's an overview of your activity and options.
        </Typography>
      </Box>

      {/* Quick Stats Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1 }} /> Quick Stats
        </Typography>
        <Grid container spacing={3}>
          <StatCard
            title="Registered Events"
            value={registeredEvents.length}
            icon={<EventAvailable />}
            color="primary.main"
          />
          <StatCard
            title="Upcoming Events (Registered)"
            value={registeredEvents.filter(e => e.status === 'upcoming').length}
            icon={<LocalActivity />}
            color="success.main"
          />
          <StatCard
            title="Favorite Category (Placeholder)"
            value={registeredEvents.length > 0 ? registeredEvents[0].category : "N/A"}
            icon={<Star />}
            color="warning.main"
          />
          {/* Add more StatCard components as needed */}
        </Grid>
      </Box>

      {/* My Registered Events Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
          My Registered Events
        </Typography>
        {registeredEvents.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>No Registered Events</Typography>
            <Typography color="text.secondary">You haven't registered for any events yet. Explore events and sign up!</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registeredEvents.map((event) => (
                  <TableRow hover key={event.id}>
                    <TableCell component="th" scope="row">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.status || 'N/A'}
                        color={event.status === 'upcoming' ? 'success' : event.status === 'past' ? 'default' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" component={RouterLink} to={`/events/${event.id}`}>
                        View Event
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Recommended Events Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
          <Explore sx={{ mr: 1 }} /> Recommended For You
        </Typography>
        {loadingRecs ? (
          <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress /></Box>
        ) : recommendedEvents.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No specific recommendations for you at the moment. Explore all events!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {recommendedEvents.map((event) => (
              <Grid item xs={12} md={4} key={event.id}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {event.title}
                    </Typography>
                    <Chip label={event.category} size="small" sx={{ my: 0.5 }} color="secondary" />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {event.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(event.date)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/events/${event.id}`}
                      startIcon={<EventAvailable />}
                    >
                      View Event
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>


      {/* Account Actions Section (e.g., Request to become Organizer) */}
      {user && user.role === 'subscriber' && (
        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            Upgrade Your Account
          </Typography>
          <Typography paragraph color="text.secondary">
            Interested in creating and managing your own events? Request to become an organizer to unlock more features.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestOrganizer}
          >
            Request Organizer Privileges
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default SubscriberDashboard;