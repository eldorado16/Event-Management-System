import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import {
  Edit,
  Delete,
  MoreVert,
  Event,
  Search,
  FilterList,
  Visibility,
  People,
  CalendarToday,
  LocationOn,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setEvents([
      {
        id: 1,
        title: "Tech Conference 2025",
        description:
          "Annual technology conference featuring latest innovations",
        category: "Technology",
        date: "2025-10-15",
        endDate: "2025-10-17",
        venue: "Convention Center",
        address: "123 Main St, City Center",
        capacity: 500,
        registered: 347,
        price: 2500,
        status: "active",
        organizer: "John Doe",
        image: "/api/placeholder/300/200",
      },
      {
        id: 2,
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
        status: "active",
        organizer: "Jane Smith",
        image: "/api/placeholder/300/200",
      },
      {
        id: 3,
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
        status: "completed",
        organizer: "Mike Johnson",
        image: "/api/placeholder/300/200",
      },
      {
        id: 4,
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
        status: "draft",
        organizer: "Sarah Williams",
        image: "/api/placeholder/300/200",
      },
    ]);
  }, []);

  const handleMenuOpen = (event, eventItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleViewEvent = () => {
    // Open event details view
    setAlert({
      show: true,
      message: `Viewing details for "${selectedEvent.title}"`,
      severity: "info",
    });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
    handleMenuClose();
  };

  const handleEditEvent = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setAlert({
        show: true,
        message: `Event "${selectedEvent.title}" has been deleted.`,
        severity: "success",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    if (selectedEvent) {
      const updatedEvents = events.map((event) =>
        event.id === selectedEvent.id
          ? {
              ...event,
              status: event.status === "active" ? "draft" : "active",
            }
          : event
      );
      setEvents(updatedEvents);
      setAlert({
        show: true,
        message: `Event status updated successfully.`,
        severity: "success",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
    handleMenuClose();
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getOccupancyColor = (registered, capacity) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "success";
  };

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
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              Event Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Monitor and manage all events in the system
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={viewMode === "table" ? "contained" : "outlined"}
              onClick={() => setViewMode("table")}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === "card" ? "contained" : "outlined"}
              onClick={() => setViewMode("card")}
            >
              Card View
            </Button>
          </Box>
        </Box>

        {/* Alert */}
        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 3 }}>
            {alert.message}
          </Alert>
        )}

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              variant="outlined"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ borderRadius: 2 }}
            >
              Filters
            </Button>
          </Box>
        </Paper>

        {/* Events Display */}
        {viewMode === "table" ? (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Organizer</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.description.substring(0, 50)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.category}
                          color="secondary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(event.date).toLocaleDateString()}
                          </Typography>
                          {event.endDate !== event.date && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              to {new Date(event.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>{event.capacity}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${event.registered}/${event.capacity}`}
                          color={getOccupancyColor(
                            event.registered,
                            event.capacity
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {event.price === 0 ? "Free" : `₹${event.price}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.status.toUpperCase()}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, event)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} md={6} lg={4} key={event.id}>
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
                        height: 160,
                        bgcolor: "primary.light",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Event sx={{ fontSize: 40, color: "primary.main" }} />
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight="bold"
                        >
                          {event.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, event)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {event.description.substring(0, 100)}...
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <LocationOn
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {event.venue}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <People
                          sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
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
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary"
                        >
                          {event.price === 0 ? "Free" : `₹${event.price}`}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewEvent}>
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem onClick={handleEditEvent}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Event
          </MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            <FilterList sx={{ mr: 1 }} fontSize="small" />
            Toggle Status
          </MenuItem>
          <MenuItem onClick={handleDeleteEvent} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Event
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Event Title"
                value={selectedEvent?.title || ""}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={selectedEvent?.description || ""}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Venue"
                value={selectedEvent?.venue || ""}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={selectedEvent?.capacity || ""}
                sx={{ mb: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default EventManagement;
