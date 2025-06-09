import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Event, TrendingUp, People, Star } from '@mui/icons-material';
import EventCard from '../components/events/EventCard';
import { useAuth } from '../hooks/useAuth'; // Import useAuth
import { getUpcomingEvents, getPastEvents } from '../utils/apiService';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user from useAuth
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [upcoming, past] = await Promise.all([
          getUpcomingEvents(),
          getPastEvents()
        ]);
        
        setUpcomingEvents(upcoming.slice(0, 3)); // Show only first 3
        setPastEvents(past.slice(0, 3)); // Show only first 3
      } catch (err) {
        setError('Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const stats = [
    { icon: <Event />, label: 'Total Events', value: '50+' },
    { icon: <People />, label: 'Active Users', value: '1,200+' },
    { icon: <TrendingUp />, label: 'Success Rate', value: '98%' },
    { icon: <Star />, label: 'Average Rating', value: '4.9' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to EventPro
          </Typography>
          <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Your premier platform for managing and discovering amazing events
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/events"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              Browse Events
            </Button>
            {!user && ( // Conditionally render "Join EventPro" button
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/signup"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Join EventPro
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
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
      </Container>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Paper sx={{ p: 2, mb: 4, backgroundColor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}

        {/* Upcoming Events Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              Upcoming Events
            </Typography>
            <Button
              component={Link}
              to="/events"
              variant="outlined"
              endIcon={<Event />}
            >
              View All Events
            </Button>
          </Box>
          
          {upcomingEvents.length > 0 ? (
            <Grid container spacing={3}>
              {upcomingEvents.map((event) => (
                <Grid item xs={12} md={4} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No upcoming events at the moment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for new events!
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Past Events Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="bold">
              Recent Past Events
            </Typography>
            <Button
              component={Link}
              to="/events"
              variant="text"
            >
              View All
            </Button>
          </Box>
          
          {pastEvents.length > 0 ? (
            <Grid container spacing={3}>
              {pastEvents.map((event) => (
                <Grid item xs={12} md={4} key={event.id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No past events to display
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          backgroundColor: 'grey.50',
          py: 6,
          mt: 4
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" paragraph color="text.secondary">
            Join thousands of event organizers and attendees who trust EventPro
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/signup"
            >
              Create Account
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/login"
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
