import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CardMembership,
  TrendingUp,
  People,
  AttachMoney,
  Visibility,
  Edit,
  Delete,
  Add,
  FilterList,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

const AdminMembership = () => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchMemberships();
    fetchStats();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await api.get("/admin/memberships");
      setMemberships(response.data);
    } catch (error) {
      setError("Failed to fetch memberships");
      console.error("Error fetching memberships:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/memberships/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewMembership = (membership) => {
    setSelectedMembership(membership);
    setViewDialog(true);
  };

  const handleEditMembership = (membership) => {
    setSelectedMembership(membership);
    setEditDialog(true);
    setError("");
    setSuccess("");
  };

  const handleDeleteMembership = (membership) => {
    setSelectedMembership(membership);
    setDeleteDialog(true);
    setError("");
  };

  const updateMembershipStatus = async () => {
    try {
      await api.put(`/admin/memberships/${selectedMembership._id}`, {
        status: selectedMembership.status,
      });
      setSuccess("Membership updated successfully");
      setEditDialog(false);
      fetchMemberships();
      fetchStats();
    } catch (error) {
      setError("Failed to update membership");
    }
  };

  const deleteMembership = async () => {
    try {
      await api.delete(`/admin/memberships/${selectedMembership._id}`);
      setSuccess("Membership deleted successfully");
      setDeleteDialog(false);
      fetchMemberships();
      fetchStats();
    } catch (error) {
      setError("Failed to delete membership");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const filteredMemberships = memberships.filter(
    (membership) => filterStatus === "all" || membership.status === filterStatus
  );

  const statsCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: "primary.main",
      bgColor: "primary.light",
    },
    {
      title: "Active Members",
      value: stats.activeMembers,
      icon: <CardMembership sx={{ fontSize: 40 }} />,
      color: "success.main",
      bgColor: "success.light",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: "warning.main",
      bgColor: "warning.light",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: "secondary.main",
      bgColor: "secondary.light",
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
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <Box display="flex" alignItems="center">
            <CardMembership
              sx={{ fontSize: 40, mr: 2, color: "primary.main" }}
            />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Membership Management
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${stat.color} 100%)`,
                    color: "white",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          fontWeight="bold"
                        >
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {stat.title}
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

        {/* Filters */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <FilterList />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              label="Status Filter"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Memberships Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Memberships ({filteredMemberships.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMemberships.map((membership) => (
                    <TableRow key={membership._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {membership.userId?.name || "Unknown User"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {membership.userId?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {membership.planName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {membership.duration}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={membership.status}
                          color={getStatusColor(membership.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(membership.startDate)}</TableCell>
                      <TableCell>{formatDate(membership.endDate)}</TableCell>
                      <TableCell>{formatCurrency(membership.amount)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewMembership(membership)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditMembership(membership)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteMembership(membership)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredMemberships.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No memberships found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Membership Details</DialogTitle>
          <DialogContent>
            {selectedMembership && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User
                    </Typography>
                    <Typography variant="body1">
                      {selectedMembership.userId?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedMembership.userId?.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Plan
                    </Typography>
                    <Typography variant="body1">
                      {selectedMembership.planName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1">
                      {selectedMembership.duration}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedMembership.status}
                      color={getStatusColor(selectedMembership.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedMembership.startDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedMembership.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedMembership.amount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Membership</DialogTitle>
          <DialogContent>
            {selectedMembership && (
              <Box sx={{ pt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedMembership.status}
                    label="Status"
                    onChange={(e) =>
                      setSelectedMembership({
                        ...selectedMembership,
                        status: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={updateMembershipStatus} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this membership? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={deleteMembership}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AdminMembership;
