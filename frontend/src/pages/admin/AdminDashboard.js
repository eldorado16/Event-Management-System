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
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People,
  Event,
  AttachMoney,
  TrendingUp,
  Analytics,
  Settings,
  Notifications,
  CardMembership,
  SupervisorAccount,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeEvents: 0,
    newUsersThisMonth: 0,
    eventsThisMonth: 0,
    totalMemberships: 0,
    activeMemberships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Mock data for demo - you can replace with actual API calls
      setStats({
        totalUsers: 1248,
        totalEvents: 156,
        totalRevenue: 45600,
        activeEvents: 23,
        newUsersThisMonth: 89,
        eventsThisMonth: 12,
        totalMemberships: 67,
        activeMemberships: 45,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <People sx={{ fontSize: 40 }} />,
      color: "primary.main",
      bgColor: "primary.light",
      change: `+${stats.newUsersThisMonth} this month`,
    },
    {
      title: "Total Events",
      value: stats.totalEvents.toLocaleString(),
      icon: <Event sx={{ fontSize: 40 }} />,
      color: "secondary.main",
      bgColor: "secondary.light",
      change: `${stats.activeEvents} active`,
    },
    {
      title: "Active Memberships",
      value: stats.activeMemberships.toLocaleString(),
      icon: <CardMembership sx={{ fontSize: 40 }} />,
      color: "info.main",
      bgColor: "info.light",
      change: `${stats.totalMemberships} total`,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: "success.main",
      bgColor: "success.light",
      change: "From memberships",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <People />,
      color: "primary",
      path: "/admin/users",
    },
    {
      title: "Event Management",
      description: "Monitor and manage events",
      icon: <Event />,
      color: "secondary",
      path: "/admin/events",
    },
    {
      title: "Membership Management",
      description: "Manage user memberships",
      icon: <CardMembership />,
      color: "info",
      path: "/admin/memberships",
    },
    {
      title: "Analytics & Reports",
      description: "View detailed reports",
      icon: <Analytics />,
      color: "success",
      path: "/admin/reports",
    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Admin Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box display="flex" alignItems="center">
            <SupervisorAccount
              sx={{ fontSize: 40, mr: 2, color: "error.main" }}
            />
            <Box>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                fontWeight="bold"
                color="error.main"
              >
                Admin Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                System Overview & Management Console
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Administrator"
            color="error"
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {adminStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${stat.color} 100%)`,
                    color: "white",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                          {stat.value}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.7, mt: 1 }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                      <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
          </Grid>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: `${action.color}.light`,
                        color: `${action.color}.main`,
                        mb: 2,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  System Status
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Server Status: Online
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Database: Connected
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Last Backup: 2 hours ago
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    System Load: Normal
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Quick Stats
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    New Users Today: 12
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Events Created Today: 3
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Memberships Sold: 5
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue Today: ₹15,000
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
