import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Save,
  Cancel,
  Event,
  LocationOn,
  AttachMoney,
  People,
  Image, // Added for image input
  Category,
  Description
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import apiService from '../utils/apiService'; // Import your apiService

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: null,
    time: null,
    location: '',
    maxParticipants: '',
    price: '',
    tags: [],
    image: '' // Added image field
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const categories = [
    'Technology',
    'Business',
    'Marketing',
    'Design',
    'Education',
    'Health',
    'Sports',
    'Entertainment',
    'Networking',
    'Workshop'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
    if (errors.date) {
      setErrors(prev => ({
        ...prev,
        date: ''
      }));
    }
  };

  const handleTimeChange = (time) => {
    setFormData(prev => ({
      ...prev,
      time: time
    }));
    if (errors.time) {
      setErrors(prev => ({
        ...prev,
        time: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Event description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.time) newErrors.time = 'Event time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.maxParticipants || formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Maximum participants must be at least 1';
    }
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';

    // Check if date is in the future
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!/^https?:\/\/.+\..+/.test(formData.image.trim())) {
      newErrors.image = 'Please enter a valid image URL (e.g., http://example.com/image.png)';
    }
    if (formData.date && formData.date.isBefore(dayjs(), 'day')) {
      newErrors.date = 'Event date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoadingSubmit(true);
    const eventPayload = {
      ...formData,
      organizer: user.name,
      organizerId: user.id,
      date: formData.date ? formData.date.format('YYYY-MM-DD') : null,
      time: formData.time ? formData.time.format('HH:mm') : null,
      price: parseFloat(formData.price) || 0,
      maxParticipants: parseInt(formData.maxParticipants),
      currentParticipants: 0,
      status: 'upcoming',
      image: formData.image.trim() // Added image to payload
    };

    try {
      await apiService.createEvent(eventPayload); // API call
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setErrors({ api: err.message || 'Failed to create event. Please try again.' });
      console.error("Failed to create event:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You must be an organizer to create events. Please request organizer privileges from your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Create New Event
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Fill in the details below to create your event
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Event created successfully! Redirecting to dashboard...
          </Alert>
        )}

        {errors.api && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.api}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Event sx={{ mr: 1 }} />
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                  placeholder="Enter a compelling event title"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe your event in detail..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category *"
                    startAdornment={<Category sx={{ mr: 1 }} />}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  placeholder="Press Enter to add tags"
                  helperText="Add relevant tags to help people find your event"
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Image Link */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                  Event Image
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  error={!!errors.image}
                  helperText={errors.image || "Link to your event's promotional image"}
                  required
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Image /></InputAdornment>)}}
                />
              </Grid>
              {/* Date & Time */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                  Date & Time
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Event Date *"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date
                    }
                  }}
                  minDate={dayjs()}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Event Time *"
                  value={formData.time}
                  onChange={handleTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.time,
                      helperText: errors.time
                    }
                  }}
                />
              </Grid>

              {/* Location & Capacity */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                  Location & Capacity
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  required
                  placeholder="Enter venue or online meeting link"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Participants"
                  name="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  error={!!errors.maxParticipants}
                  helperText={errors.maxParticipants}
                  required
                  inputProps={{ min: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <People />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Pricing */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                  Pricing
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ticket Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price || "Enter 0 for free events"}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loadingSubmit}
                    size="large"
                  >
                    {loadingSubmit ? 'Creating...' : 'Create Event'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
