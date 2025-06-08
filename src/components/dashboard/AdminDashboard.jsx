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
  InputAdornment
} from '@mui/material';
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
  Block,
  PersonAdd,
  EventAvailable,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { mockEvents, mockUsers, mockRegistrations } from '../../utils/mockData';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', item: null });

  // Mock organizer requests
  const [organizerRequests] = useState([
    { id: 1, userId: 3, userName: 'Regular User', userEmail: 'user@eventpro.com', requestDate: '2024-06-08', status: 'pending' },
    { id: 2, userId: 4, userName: 'Jane Smith', userEmail: 'jane@example.com', requestDate: '2024-06-07', status: 'pending' },
  ]);

  const stats = [
    { icon: <People />, label: 'Total Users', value: mockUsers.length + 50, color: 'primary' },
    { icon: <Event />, label: 'Total Events', value: mockEvents.length, color: 'secondary' },
    { icon: <TrendingUp />, label: 'Active Registrations', value: mockRegistrations.length + 45, color: 'success' },
    { icon: <AdminPanelSettings />, label: 'Pending Requests', value: organizerRequests.filter(r => r.status === 'pending').length, color: 'warning' }
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    if (type === 'user') {
      setSelectedUser(item);
    } else if (type === 'event') {
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

  const executeAction = () => {
    const { type, item } = confirmDialog;
    // In a real app, these would make API calls
    console.log(`Executing ${type} action on:`, item);
    setConfirmDialog({ open: false, type: '', item: null });
  };

  const handleOrganizerRequest = (requestId, action) => {
    // In a real app, this would make an API call
    console.log(`${action} organizer request:`, requestId);
  };

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = mockEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
              <Box sx={{ color: `${stat.color}.main`, mb: 1 }}>
                {stat.icon}
              </Box>
              <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                {stat.value}
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Users Management" />
            <Tab label="Events Management" />
            <Tab label="Organizer Requests" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Users Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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
              sx={{ flexGrow: 1 }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>
            <Button variant="contained" startIcon={<PersonAdd />}>
              Add User
            </Button>
          </Box>

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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'error' : user.role === 'organizer' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label="Active" color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, user, 'user')}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Events Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
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
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>
            <Button variant="contained" startIcon={<EventAvailable />}>
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
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.organizer}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.currentParticipants}/{event.maxParticipants}</TableCell>
                    <TableCell>
                      <Chip 
                        label={event.status} 
                        color={event.status === 'upcoming' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, event, 'event')}>
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
          
          {organizerRequests.filter(r => r.status === 'pending').length > 0 ? (
            <Grid container spacing={2}>
              {organizerRequests.filter(r => r.status === 'pending').map((request) => (
                <Grid item xs={12} md={6} key={request.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {request.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {request.userEmail}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Requested on: {request.requestDate}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => handleOrganizerRequest(request.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => handleOrganizerRequest(request.id, 'reject')}
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

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Platform Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Revenue"
                      secondary="$45,230"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly Growth"
                      secondary="+12.5%"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Event />
                    </ListItemIcon>
                    <ListItemText
                      primary="Events This Month"
                      secondary="24 events"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="New user registration"
                      secondary="john.doe@example.com - 2 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Event created"
                      secondary="React Workshop by Tech Events Inc. - 4 hours ago"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Organizer request approved"
                      secondary="sarah.wilson@example.com - 1 day ago"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('View details')}>
          <Visibility sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => console.log('Edit')}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleConfirmAction('suspend', selectedUser || selectedEvent)}>
          <Block sx={{ mr: 1 }} /> Suspend
        </MenuItem>
        <MenuItem onClick={() => handleConfirmAction('delete', selectedUser || selectedEvent)}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '', item: null })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.type} this {selectedUser ? 'user' : 'event'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', item: null })}>
            Cancel
          </Button>
          <Button onClick={executeAction} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

