import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Event,
  CalendarToday,
  LocationOn,
  People,
  AccessTime,
  CheckCircle,
  Cancel,
  Pending,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const MyEvents = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setMyEvents([
      {
        id: 1,
        title: "Tech Meetup 2025",
        description: "Monthly tech meetup for developers",
        category: "Technology",
        date: "2025-10-20",
        endDate: "2025-10-20",
        venue: "Tech Hub",
        address: "123 Tech St, Silicon Valley",
        capacity: 50,
        registered: 35,
        price: 0,
        status: "active",
        image: "/api/placeholder/300/200",
      },
      {
        id: 2,
        title: "Web Development Workshop",
        description: "Learn modern web development techniques",
        category: "Education",
        date: "2025-11-15",
        endDate: "2025-11-15",
        venue: "Learning Center",
        address: "456 Education Ave, Downtown",
        capacity: 30,
        registered: 28,
        price: 1000,
        status: "active",
        image: "/api/placeholder/300/200",
      },
    ]);

    setRegisteredEvents([
      {
        id: 3,
        title: "Digital Marketing Summit",
        description: "Learn about the latest digital marketing strategies",
        category: "Business",
        date: "2025-11-20",
        endDate: "2025-11-20",
        venue: "Business Center",
        address: "456 Business Ave, Downtown",
        capacity: 200,
        registered: 156,
        price: 1500,
        status: "confirmed",
        registrationDate: "2025-09-15",
        image: "/api/placeholder/300/200",
      },
      {
        id: 4,
        title: "Art Exhibition Opening",
        description: "Contemporary art exhibition featuring local artists",
        category: "Arts",
        date: "2025-09-30",
        endDate: "2025-10-30",
        venue: "Art Gallery",
        address: "789 Culture St, Arts District",
        capacity: 100,
        registered: 89,
        price: 0,
        status: "attended",
        registrationDate: "2025-09-10",
        image: "/api/placeholder/300/200",
      },
      {
        id: 5,
        title: "Music Festival 2025",
        description: "Three-day music festival with international artists",
        category: "Entertainment",
        date: "2025-12-15",
        endDate: "2025-12-17",
        venue: "City Park",
        address: "321 Park Ave, Green District",
        capacity: 1000,
        registered: 234,
        price: 3500,
        status: "pending",
        registrationDate: "2025-09-20",
        image: "/api/placeholder/300/200",
      },
    ]);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle color="success" />;
      case "attended":
        return <CheckCircle color="primary" />;
      case "pending":
        return <Pending color="warning" />;
      case "cancelled":
        return <Cancel color="error" />;
      default:
        return <Pending color="default" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "attended":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            My Events
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your created events and view your registrations
          </Typography>
        </Box>

        {/* User Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Event sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {myEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Events Created
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <People sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {myEvents.reduce((sum, event) => sum + event.registered, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Registrations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <CalendarToday
                  sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                />
                <Typography variant="h4" fontWeight="bold">
                  {registeredEvents.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Events Registered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* My Created Events */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Events I Created
            </Typography>
            <Button variant="contained" href="/create-event">
              Create New Event
            </Button>
          </Box>

          {myEvents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Event sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by creating your first event to share with the community
              </Typography>
              <Button variant="contained" href="/create-event">
                Create Your First Event
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {myEvents.map((event) => (
                <Grid item xs={12} md={6} key={event.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 120,
                          bgcolor: "primary.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Event sx={{ fontSize: 40, color: "primary.main" }} />
                      </CardMedia>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {event.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {event.description}
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <CalendarToday
                            sx={{
                              fontSize: 16,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.date).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {event.venue}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <People
                            sx={{
                              fontSize: 16,
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {event.registered}/{event.capacity} registered
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={event.status.toUpperCase()}
                            color="success"
                            size="small"
                          />
                          <Button variant="outlined" size="small">
                            Manage
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* My Registered Events */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Events I'm Registered For
          </Typography>

          {registeredEvents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CalendarToday
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No event registrations yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Browse available events and register for the ones you're
                interested in
              </Typography>
              <Button variant="contained" href="/events">
                Browse Events
              </Button>
            </Box>
          ) : (
            <List>
              {registeredEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{ bgcolor: "primary.light", width: 50, height: 50 }}
                      >
                        <Event color="primary" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.status.toUpperCase()}
                            color={getStatusColor(event.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {event.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              flexWrap: "wrap",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption">
                                {new Date(event.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption">
                                {event.venue}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption">
                                Registered:{" "}
                                {new Date(
                                  event.registrationDate
                                ).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getStatusIcon(event.status)}
                      <Button variant="outlined" size="small">
                        View Details
                      </Button>
                    </Box>
                  </ListItem>
                  {index < registeredEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default MyEvents;
