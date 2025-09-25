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
  Avatar,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  MoreVert,
  PersonAdd,
  Search,
  FilterList,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setUsers([
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "user",
        status: "active",
        joinDate: "2024-01-15",
        lastLogin: "2024-03-10",
        eventsAttended: 5,
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        role: "user",
        status: "active",
        joinDate: "2024-02-20",
        lastLogin: "2024-03-12",
        eventsAttended: 8,
      },
      {
        id: 3,
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@example.com",
        role: "admin",
        status: "active",
        joinDate: "2023-12-01",
        lastLogin: "2024-03-13",
        eventsAttended: 12,
      },
      {
        id: 4,
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        role: "user",
        status: "inactive",
        joinDate: "2024-01-30",
        lastLogin: "2024-02-15",
        eventsAttended: 2,
      },
    ]);
  }, []);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setAlert({
        show: true,
        message: `User ${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`,
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
    if (selectedUser) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user
      );
      setUsers(updatedUsers);
      setAlert({
        show: true,
        message: `User status updated successfully.`,
        severity: "success",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
    handleMenuClose();
  };

  const handleChangeRole = () => {
    if (selectedUser) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, role: user.role === "admin" ? "user" : "admin" }
          : user
      );
      setUsers(updatedUsers);
      setAlert({
        show: true,
        message: `User role updated successfully.`,
        severity: "success",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
    handleMenuClose();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    return role === "admin" ? "error" : "primary";
  };

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "default";
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
              User Management
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage users, roles, and permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            sx={{ borderRadius: 2 }}
          >
            Add New User
          </Button>
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
              placeholder="Search users..."
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

        {/* Users Table */}
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Events Attended</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "primary.main",
                          }}
                        >
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.toUpperCase()}
                        color={getRoleColor(user.role)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status.toUpperCase()}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.joinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.eventsAttended}
                        color="secondary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
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

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditUser}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit User
          </MenuItem>
          <MenuItem onClick={handleChangeRole}>
            <PersonAdd sx={{ mr: 1 }} fontSize="small" />
            Change Role
          </MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            <FilterList sx={{ mr: 1 }} fontSize="small" />
            Toggle Status
          </MenuItem>
          <MenuItem onClick={handleDeleteUser} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete User
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={selectedUser?.firstName || ""}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={selectedUser?.lastName || ""}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={selectedUser?.email || ""}
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

export default UserManagement;
