import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress, // For loading states
  Snackbar // For future feedback messages
} from "@mui/material";
import {
  People,
  Event,
  TrendingUp,
  AdminPanelSettings,
  MoreVert,
  Check,
  Close,
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  PersonAdd,
  EventAvailable,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../hooks/useAuth";
// import { mockEvents, mockUsers, mockRegistrations } from "../../utils/mockData"; // Removing mock data
import apiService from "../../utils/apiService"; // Import apiService

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [usersData, setUsersData] = useState([]); // For Users Management (to be implemented later)
  const [eventsData, setEventsData] = useState([]); // For Events Management
  const [organizerRequestsData, setOrganizerRequestsData] = useState([]); // For Organizer Requests (to be implemented later)

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true); // For the top statistics cards

  // Error states
  const [usersError, setUsersError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [statsError, setStatsError] = useState(""); // For the top statistics cards

  // UI states (existing)
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "",
    item: null,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // For future actions
  const [viewUserDialog, setViewUserDialog] = useState({ open: false, user: null });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingStats(true);
      setLoadingEvents(true);
      setLoadingUsers(true); // Set loading for users

      try {
        // Fetch all necessary data concurrently
        const [eventsResponse, usersResponse] = await Promise.all([
          apiService.getEvents(),
          apiService.getAllUsers() // Fetch users
        ]);

        setEventsData(Array.isArray(eventsResponse) ? eventsResponse : []);
        setEventsError("");

        setUsersData(Array.isArray(usersResponse) ? usersResponse : []); // Set users data
        setUsersError("");


        // Placeholder for fetching organizer requests if needed for stats
        // setOrganizerRequestsData([]); // Or fetch if apiService.getOrganizerRequests exists

      } catch (err) {
        const errorMsg = err.message || "Failed to load dashboard data.";
        setStatsError(errorMsg);
        setEventsError(errorMsg); // If events fetch was the primary part of this block
        setEventsData([]); // Ensure eventsData is an array on error
        setUsersError(errorMsg); // Set users error as well
        setUsersData([]); // Ensure usersData is an array on error
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingStats(false);
        setLoadingEvents(false);
        setLoadingUsers(false); // Set loading for users to false
      }
    };
    fetchDashboardData();
  }, []);

  const dynamicStats = [
    {
      icon: <People />,
      label: "Total Users",
      value: usersData.length, // Will update when usersData is fetched
      color: "primary",
    },
    {
      icon: <Event />,
      label: "Total Events",
      value: eventsData.length,
      color: "secondary",
    },
    // Active Registrations might require a separate or more complex query
    {
      icon: <AdminPanelSettings />,
      label: "Pending Requests",
      value: Array.isArray(organizerRequestsData)
        ? organizerRequestsData.filter((r) => r.status === "pending").length
        : 0,
      color: "warning",
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    if (type === "user") {
      setSelectedEvent(null); // Clear other selection
      setSelectedUser(item);
    } else if (type === "event") {
      setSelectedUser(null); // Clear other selection
      setSelectedEvent(item);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
    setSelectedEvent(null);
  };

  const handleConfirmAction = (type, item) => {
    setConfirmDialog({ open: true, type, item });
    handleMenuClose();
  };

  const handleViewUserDetails = (userItem) => {
    if (userItem?.email && userItem?.role) { // It's a user
      setViewUserDialog({ open: true, user: userItem });
      handleMenuClose();
    } else if (userItem?.title) { // It's an event
      navigate(`/events/${userItem.id}`);
      handleMenuClose();
    }
  };

  const executeAction = async () => {
    const { type, item } = confirmDialog;
    if (!item) return;

    try {
      if (item.email && item.role) { // Heuristic: Check for properties specific to a user object
        if (type === "suspend") {
          await apiService.suspendUser(item.id, !item.isSuspended);
          setUsersData(
            usersData.map((u) =>
              u.id === item.id ? { ...u, isSuspended: !u.isSuspended } : u
            )
          );
          setSnackbar({ open: true, message: `User ${item.isSuspended ? 'unsuspended' : 'suspended'} successfully.`, severity: 'success' });
        } else if (type === "delete") {
          await apiService.deleteUserByAdmin(item.id);
          setUsersData(usersData.filter((u) => u.id !== item.id));
          setSnackbar({ open: true, message: 'User deleted successfully.', severity: 'success' });
        }
      } else if (item.title) { // Heuristic: Check for properties specific to an event object
        // Handle event actions here if needed in the future
        if (type === "delete") {
          await apiService.deleteEvent(item.id); // Assuming admin can delete events
          setEventsData(eventsData.filter(e => e.id !== item.id));
          setSnackbar({ open: true, message: 'Event deleted successfully.', severity: 'success' });
        }
        console.log(`Executing ${type} action on event:`, item);
      }
    } catch (err) {
      console.error(`Failed to ${type} item:`, err);
      setSnackbar({ open: true, message: err.message || `Failed to ${type} item. Please try again.`, severity: 'error' });
    } finally {
      setConfirmDialog({ open: false, type: "", item: null });
    }
  };

  const handleOrganizerRequest = (requestId, action) => {
    // In a real app, this would make an API call
    console.log(`${action} organizer request:`, requestId);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredUsers = Array.isArray(usersData)
    ? usersData.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const filteredEvents = Array.isArray(eventsData)
    ? eventsData.filter(
        (event) =>
          (event.title &&
            event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.organizer &&
            typeof event.organizer === "string" &&
            event.organizer.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (event.organizer &&
            typeof event.organizer === "object" &&
            event.organizer.name &&
            event.organizer.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      )
    : [];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage users, events, and monitor platform activity
        </Typography>
      </Box>

      {statsError && !loadingStats && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statsError}
        </Alert>
      )}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dynamicStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>{stat.icon}</Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={`${stat.color}.main`}
              >
                {loadingStats ? <CircularProgress size={24} /> : stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Users Management" />
            <Tab label="Events Management" />
            <Tab label="Organizer Requests" />
          </Tabs>
        </Box>

        {/* Users Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }} // This TextField is inside the Box
            />
          </Box> {/* This Box should be closed here */}
          {loadingUsers && ( // Changed from loadingEvents to loadingUsers
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />{" "}
              <Typography sx={{ ml: 2 }}>Loading users...</Typography>
            </Box>
          )}
          {usersError && !loadingUsers && ( // Changed from eventsError to usersError
            <Alert severity="error">{usersError}</Alert>
          )}
          {!loadingUsers && // Changed from loadingEvents
            !usersError && // Changed from eventsError
            filteredUsers.length === 0 && // Changed from filteredEvents
            searchTerm && (
              <Alert severity="info">
                No users found matching "{searchTerm}".
              </Alert>
            )}
          {!loadingUsers && // Changed from loadingEvents
            !usersError && // Changed from eventsError
            filteredUsers.length === 0 && // Changed from filteredEvents
            !searchTerm && <Alert severity="info">No users found.</Alert>}
          {!loadingUsers && !usersError && filteredUsers.length > 0 && ( // Changed from loadingEvents, eventsError, filteredEvents
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u) => ( // Changed variable name for clarity
                    <TableRow key={u.id}>
                      <TableCell>{u.name || "N/A"}</TableCell>
                      <TableCell>{u.email || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "N/A"}
                          color={
                            u.role === "admin"
                              ? "error"
                              : u.role === "organizer"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={u.isSuspended ? "Suspended" : "Active"} // Assuming an isSuspended property
                          color={u.isSuspended ? "error" : "success"} 
                          size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, u, "user")}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Events Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              startIcon={<EventAvailable />}
              onClick={() => navigate('/events/create')} // Navigate to create event screen
            >
              Add Event
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Organizer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((evt) => (
                  <TableRow key={evt.id}>
                    <TableCell>{evt.title || "N/A"}</TableCell>
                    <TableCell>
                      {evt.organizer?.name || evt.organizer || "N/A"}
                    </TableCell>
                    <TableCell>
                      {evt.date
                        ? new Date(evt.date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {evt.currentParticipants !== undefined &&
                      evt.maxParticipants !== undefined
                        ? `${evt.currentParticipants}/${evt.maxParticipants}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          evt.status
                            ? evt.status.charAt(0).toUpperCase() +
                              evt.status.slice(1)
                            : "N/A"
                        }
                        color={
                          evt.status === "upcoming" ? "success" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, evt, "event")}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Organizer Requests Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Pending Organizer Requests
          </Typography>

          {Array.isArray(organizerRequestsData) &&
          organizerRequestsData.filter((r) => r.status === "pending").length >
            0 ? (
            <Grid container spacing={2}>
              {organizerRequestsData
                .filter((r) => r.status === "pending")
                .map((request) => (
                  <Grid item xs={12} md={6} key={request.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {request.userName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {request.userEmail || "N/A"}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          Requested on:{" "}
                          {request.requestDate
                            ? new Date(request.requestDate).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            onClick={() =>
                              handleOrganizerRequest(request.id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Close />}
                            onClick={() =>
                              handleOrganizerRequest(request.id, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No pending organizer requests at this time.
            </Alert>
          )}
        </TabPanel>

      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => handleViewUserDetails(selectedUser || selectedEvent)}
          disabled={!(selectedUser || selectedEvent)} // Disable if nothing is selected
        >
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem
          onClick={() => handleConfirmAction("delete", selectedUser || selectedEvent) }
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: "", item: null })}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.type} this{" "}
            {confirmDialog.item?.email ? 'user' : 'event'}: {" "}
            <strong>
              {confirmDialog.item?.name || confirmDialog.item?.title || "item"}
            </strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, type: "", item: null })
            }
          >
            Cancel
          </Button>
          <Button 
            onClick={executeAction} 
            color="error"
            variant="contained"
          >
            Confirm {confirmDialog.type}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* View User Details Dialog */}
      <Dialog open={viewUserDialog.open} onClose={() => setViewUserDialog({ open: false, user: null })}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {viewUserDialog.user ? (
            <Box>
              <Typography variant="subtitle1"><strong>Name:</strong> {viewUserDialog.user.name}</Typography>
              <Typography variant="subtitle1"><strong>Email:</strong> {viewUserDialog.user.email}</Typography>
              <Typography variant="subtitle1"><strong>Role:</strong> {viewUserDialog.user.role?.charAt(0).toUpperCase() + viewUserDialog.user.role?.slice(1)}</Typography>
              <Typography variant="subtitle1"><strong>Status:</strong> {viewUserDialog.user.isSuspended ? "Suspended" : "Active"}</Typography>
              {/* Add more details as needed */}
            </Box>
          ) : (
            <Typography>No user details to display.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUserDialog({ open: false, user: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
