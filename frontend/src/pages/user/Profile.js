import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  LocationOn,
  Cake,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    location: user?.location || "",
    dateOfBirth: user?.dateOfBirth || "",
    company: user?.company || "",
    website: user?.website || "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call to update the user
      await updateUser(formData);
      setEditMode(false);
      setAlert({
        show: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to update profile. Please try again.",
        severity: "error",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      dateOfBirth: user?.dateOfBirth || "",
      company: user?.company || "",
      website: user?.website || "",
    });
    setEditMode(false);
  };

  const profileStats = [
    {
      label: "Events Created",
      value: "3",
      icon: <Person color="primary" />,
    },
    {
      label: "Events Attended",
      value: "12",
      icon: <Email color="secondary" />,
    },
    {
      label: "Network Connections",
      value: "48",
      icon: <Phone color="success" />,
    },
    {
      label: "Member Since",
      value: "Jan 2024",
      icon: <Cake color="warning" />,
    },
  ];

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              My Profile
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage your personal information and preferences
            </Typography>
          </Box>
          {!editMode && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {/* Alert */}
        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 3 }}>
            {alert.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Picture and Basic Info */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Box
                sx={{ position: "relative", display: "inline-block", mb: 2 }}
              >
                <Avatar
                  src={user?.profileImage}
                  sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                >
                  {formData.firstName?.charAt(0)}
                  {formData.lastName?.charAt(0)}
                </Avatar>
                {editMode && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                    size="small"
                  >
                    <PhotoCamera />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {formData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role === "admin" ? "Administrator" : "Member"}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Profile Stats */}
              <Grid container spacing={2}>
                {profileStats.map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        {stat.icon}
                        <Typography variant="h6" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Personal Information
                </Typography>
                {editMode && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>

                {/* Bio */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    multiline
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>

                {/* Additional Information */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant={editMode ? "outlined" : "filled"}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Account Settings */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                    Change Password
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                    Notification Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
                    Privacy Settings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Delete Account
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Profile;
