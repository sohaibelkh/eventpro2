import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";
import EventCard from "../components/events/EventCard";
import apiService from "../utils/apiService";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEvents();
        setEvents(response);
        setFilteredEvents(response);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(lowerSearch) ||
        event.description.toLowerCase().includes(lowerSearch) ||
        event.location.toLowerCase().includes(lowerSearch);

      const matchesCategory =
        !categoryFilter || event.category === categoryFilter;
      const matchesStatus = !statusFilter || event.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    setFilteredEvents(filtered);
  }, [searchTerm, categoryFilter, statusFilter, events]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  const categories = [...new Set(events.map((event) => event.category))];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading events...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          All Events
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover amazing events happening around you
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Search & Filter Events</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            fullWidth
            label="Search events"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Events</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
            </Select>
          </FormControl>

          {(searchTerm || categoryFilter || statusFilter) && (
            <Box>
              <Chip
                label="Clear Filters"
                onClick={handleClearFilters}
                onDelete={handleClearFilters}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredEvents.length} of {events.length} events
        </Typography>
      </Box>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredEvents.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Try adjusting your search criteria or filters
          </Typography>
          <Chip
            label="Clear All Filters"
            onClick={handleClearFilters}
            color="primary"
            variant="contained"
          />
        </Paper>
      )}
    </Container>
  );
};

export default Events;
