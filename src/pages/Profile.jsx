import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Save, Edit } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setEditing(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Profile Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your personal information and preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
                fontSize: "3rem",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since June 2024
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: "left" }}>
              <Typography variant="body2" gutterBottom>
                <strong>Account Status:</strong> Active
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email Verified:</strong> Yes
              </Typography>
              <Typography variant="body2">
                <strong>Last Login:</strong> Today
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Personal Information
              </Typography>
              {!editing && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </Grid>

                {editing && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          {/* Account Settings */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Account Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled>
                  <InputLabel>Account Type</InputLabel>
                  <Select value={user?.role || ""} label="Account Type">
                    <MenuItem value="subscriber">Subscriber</MenuItem>
                    <MenuItem value="organizer">Organizer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  To change your account type, please contact support or submit
                  a request through your dashboard.
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Danger Zone */}
          <Paper
            elevation={2}
            sx={{ p: 3, mt: 3, border: 1, borderColor: "error.main" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              color="error"
              fontWeight="bold"
            >
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Once you delete your account, there is no going back. Please be
              certain.
            </Typography>
            <Button variant="outlined" color="error">
              Delete Account
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
