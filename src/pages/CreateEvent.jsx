import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Divider,
  Avatar,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Save,
  Cancel,
  Event,
  LocationOn,
  AttachMoney,
  People,
  Image,
  Category,
  Description,
  Tag,
  Schedule,
  ConfirmationNumber,
} from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAuth } from "../hooks/useAuth";
import apiService from "../utils/apiService";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: null,
    time: null,
    location: "",
    maxParticipants: "",
    price: "0",
    tags: [],
    image: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const categories = [
    "Technology",
    "Business",
    "Marketing",
    "Design",
    "Education",
    "Health",
    "Sports",
    "Entertainment",
    "Networking",
    "Workshop",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date,
    }));
    if (errors.date) {
      setErrors((prev) => ({
        ...prev,
        date: "",
      }));
    }
  };

  const handleTimeChange = (time) => {
    setFormData((prev) => ({
      ...prev,
      time: time,
    }));
    if (errors.time) {
      setErrors((prev) => ({
        ...prev,
        time: "",
      }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim())
      newErrors.description = "Event description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Event date is required";
    if (!formData.time) newErrors.time = "Event time is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.maxParticipants || formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Maximum participants must be at least 1";
    }
    if (formData.price < 0) newErrors.price = "Price cannot be negative";
    if (!formData.image.trim()) {
      newErrors.image = "Image URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.image.trim())) {
      newErrors.image =
        "Please enter a valid image URL (e.g., http://example.com/image.png)";
    }
    if (formData.date && formData.date.isBefore(dayjs(), "day")) {
      newErrors.date = "Event date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!validateForm()) return;

    setLoadingSubmit(true);
    const eventPayload = {
      ...formData,
      organizer: user.name,
      organizerId: user.id,
      date: formData.date ? formData.date.format("YYYY-MM-DD") : null,
      time: formData.time ? formData.time.format("HH:mm") : null,
      price: parseFloat(formData.price) || 0,
      maxParticipants: parseInt(formData.maxParticipants),
      currentParticipants: 0,
      status: "upcoming",
      image: formData.image.trim(),
    };

    try {
      await apiService.createEvent(eventPayload);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setErrors({
        api: err.message || "Failed to create event. Please try again.",
      });
      console.error("Failed to create event:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (user?.role !== "organizer" && user?.role !== "admin") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 1 }}>
          You must be an organizer to create events. Please request organizer
          privileges from your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            mb: 2,
            textAlign: "center",
            background: "linear-gradient(135deg, #0078D4 0%, #6a11cb 100%)",
            color: "white",
            p: 1,
            borderRadius: 5,
            width: "80%",
            margin: "0 auto",
            boxShadow: 5,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Create Your Event
          </Typography>
          <Typography variant="h6">
            Share your passion with the world - fill in the details below to
            create an unforgettable experience
          </Typography>
        </Box>

        {/* Status Alerts */}
        <Box sx={{ mb: 2 }}>
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2, boxShadow: 1 }}>
              Event created successfully! Redirecting to dashboard...
            </Alert>
          )}
          {errors.api && (
            <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 1 }}>
              {errors.api}
            </Alert>
          )}
        </Box>

        <Grid container spacing={4} sx={{ width: "80%", margin: "0 auto" }}>
          {/* Main Form Column */}
          <Grid item xs={2} md={8}>
            <Paper
              elevation={4}
              sx={{
                p: 2,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <Box component="form" onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <Card
                  variant="outlined"
                  sx={{ mb: 4, borderLeft: "4px solid #6a11cb" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Event color="primary" fontSize="large" />
                      <Typography variant="h5" fontWeight="bold">
                        Basic Information
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
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
                          variant="outlined"
                          size="medium"
                          placeholder="e.g., Annual Tech Conference 2023"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
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
                          helperText={
                            errors.description ||
                            "Tell attendees what to expect"
                          }
                          required
                          multiline
                          rows={5}
                          variant="outlined"
                          placeholder="Describe your event in detail..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Description color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl
                          fullWidth
                          error={!!errors.category}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        >
                          <InputLabel>Category *</InputLabel>
                          <Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            label="Category *"
                            variant="outlined"
                            startAdornment={<Category sx={{ mr: 1 }} />}
                          >
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.category && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 0.5, ml: 2 }}
                            >
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
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Tag color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {formData.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleRemoveTag(tag)}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Event Image Section */}
                <Card
                  variant="outlined"
                  sx={{ mb: 4, borderLeft: "4px solid #2575fc" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Image color="primary" fontSize="large" />
                      <Typography variant="h5" fontWeight="bold">
                        Event Image
                      </Typography>
                    </Stack>

                    <TextField
                      fullWidth
                      label="Image URL"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      error={!!errors.image}
                      helperText={
                        errors.image ||
                        "Link to a high-quality promotional image (800x450 recommended)"
                      }
                      required
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Image color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {formData.image && !errors.image && (
                      <Box sx={{ mt: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          Image Preview:
                        </Typography>
                        <Avatar
                          src={formData.image}
                          variant="rounded"
                          sx={{
                            width: "100%",
                            height: 200,
                            mt: 1,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Date & Time Section */}
                <Card
                  variant="outlined"
                  sx={{ mb: 4, borderLeft: "4px solid #11cb6a" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Schedule color="primary" fontSize="large" />
                      <Typography variant="h5" fontWeight="bold">
                        Date & Time
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Event Date *"
                          value={formData.date}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.date,
                              helperText: errors.date,
                              variant: "outlined",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              },
                            },
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
                              helperText: errors.time,
                              variant: "outlined",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Location & Capacity Section */}
                <Card
                  variant="outlined"
                  sx={{ mb: 4, borderLeft: "4px solid #ff9800" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <LocationOn color="primary" fontSize="large" />
                      <Typography variant="h5" fontWeight="bold">
                        Location & Capacity
                      </Typography>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          error={!!errors.location}
                          helperText={
                            errors.location ||
                            "Physical venue or online meeting link"
                          }
                          required
                          variant="outlined"
                          placeholder="e.g., Convention Center or Zoom Link"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn color="primary" />
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
                          variant="outlined"
                          inputProps={{ min: 1 }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <People color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Pricing Section */}
                <Card
                  variant="outlined"
                  sx={{ mb: 4, borderLeft: "4px solid #e91e63" }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <ConfirmationNumber color="primary" fontSize="large" />
                      <Typography variant="h5" fontWeight="bold">
                        Pricing
                      </Typography>
                    </Stack>

                    <TextField
                      fullWidth
                      label="Ticket Price ($)"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleChange}
                      error={!!errors.price}
                      helperText={errors.price || "Enter 0 for free events"}
                      variant="outlined"
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                        maxWidth: 300,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 4,
                    "& .MuiButton-root": {
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: "bold",
                      textTransform: "none",
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    size="large"
                    color="secondary"
                    sx={{ borderWidth: 2, "&:hover": { borderWidth: 2 } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loadingSubmit}
                    size="large"
                    sx={{
                      background:
                        "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a0db5 0%, #1a65e5 100%)",
                      },
                    }}
                  >
                    {loadingSubmit ? "Creating..." : "Publish Event"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Preview Column */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                position: "sticky",
                top: 20,
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{
                  color: "primary.main",
                  pb: 1,
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                }}
              >
                Event Preview
              </Typography>

              {formData.title ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Avatar
                      src={formData.image}
                      variant="rounded"
                      sx={{
                        width: "100%",
                        height: 180,
                        mb: 2,
                        borderRadius: 2,
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {formData.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {formData.description.substring(0, 100)}
                      {formData.description.length > 100 ? "..." : ""}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: "rgba(106, 17, 203, 0.05)",
                      p: 2,
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Event color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {formData.date
                            ? formData.date.format("MMMM D, YYYY")
                            : "Not set"}
                          {formData.time
                            ? ` at ${formData.time.format("h:mm A")}`
                            : ""}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOn color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {formData.location || "Location not specified"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <People color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {formData.maxParticipants
                            ? `Up to ${formData.maxParticipants} attendees`
                            : "Capacity not set"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <AttachMoney color="primary" fontSize="small" />
                        <Typography variant="body2">
                          {formData.price > 0
                            ? `$${parseFloat(formData.price).toFixed(2)}`
                            : "Free event"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  {formData.tags.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {formData.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Your event preview will appear here as you fill out the form
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent;
