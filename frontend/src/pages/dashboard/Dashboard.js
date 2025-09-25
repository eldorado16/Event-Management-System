import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Event,
  People,
  Person,
  TrendingUp,
  CalendarToday,
  Notifications,
  Star,
  CardMembership,
  Add,
  Visibility,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    eventsCreated: 0,
    eventsRegistered: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
  });
  const [membership, setMembership] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  const fetchUserDashboardData = async () => {
    try {
      // Fetch user statistics
      const statsResponse = await api.get("/users/dashboard/stats");
      setUserStats(statsResponse.data);

      // Fetch membership info
      try {
        const membershipResponse = await api.get("/memberships/current");
        setMembership(membershipResponse.data);
      } catch (error) {
        // No membership found
        setMembership(null);
      }

      // Fetch recent activities
      const activitiesResponse = await api.get("/users/dashboard/activities");
      setRecentActivities(activitiesResponse.data);

      // Fetch upcoming events
      const eventsResponse = await api.get("/users/dashboard/upcoming-events");
      setUpcomingEvents(eventsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Events Created",
      value: userStats.eventsCreated || 0,
      icon: <Event sx={{ fontSize: 40 }} />,
      color: "primary.main",
      bgColor: "primary.light",
      action: () => navigate("/dashboard/my-events"),
    },
    {
      title: "Events Registered",
      value: userStats.eventsRegistered || 0,
      icon: <CalendarToday sx={{ fontSize: 40 }} />,
      color: "secondary.main",
      bgColor: "secondary.light",
      action: () => navigate("/dashboard/my-events"),
    },
    {
      title: "Events Attended",
      value: userStats.eventsAttended || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: "info.main",
      bgColor: "info.light",
      action: () => navigate("/events"),
    },
    {
      title: "Upcoming Events",
      value: userStats.upcomingEvents || 0,
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: "warning.main",
      bgColor: "warning.light",
      action: () => navigate("/events"),
    },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Here's what's happening with your events and activities.
          </Typography>
        </Box>

        {/* Membership Status Alert */}
        {!membership && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/dashboard/membership")}
                startIcon={<CardMembership />}
              >
                View Plans
              </Button>
            }
          >
            <strong>Unlock More Features!</strong> Get a membership to create
            unlimited events and access premium features.
          </Alert>
        )}

        {membership && (
          <Card
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <CardContent>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <CardMembership sx={{ fontSize: 40 }} />
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" gutterBottom>
                    {membership.planName} Member
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active until {formatDate(membership.endDate)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: "white", color: "white" }}
                    onClick={() => navigate("/dashboard/membership")}
                  >
                    Manage
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* User Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Avatar src={user?.profileImage} sx={{ width: 80, height: 80 }}>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>
                <Chip
                  label={user?.role === "admin" ? "Administrator" : "Member"}
                  color={user?.role === "admin" ? "error" : "primary"}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate("/create-event")}
                  sx={{ py: 1.5 }}
                >
                  Create Event
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => navigate("/events")}
                  sx={{ py: 1.5 }}
                >
                  Browse Events
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Event />}
                  onClick={() => navigate("/dashboard/my-events")}
                  sx={{ py: 1.5 }}
                >
                  My Events
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => navigate("/dashboard/profile")}
                  sx={{ py: 1.5 }}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    cursor: stat.action ? "pointer" : "default",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={stat.action}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent event activities and updates will appear here. This
              includes event registrations, updates from organized events, and
              important notifications.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
