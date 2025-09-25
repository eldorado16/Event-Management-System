import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  ExitToApp,
  Dashboard,
  Person,
  Event,
} from "@mui/icons-material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../../contexts/AuthContext";

const Navbar = ({ onSidebarToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleProfileMenuClose();
  };

  const isActivePath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ zIndex: theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Sidebar toggle for authenticated users */}
        {isAuthenticated && (
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onSidebarToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Event />
            {!isMobile && "Event Management System"}
            {isMobile && "EMS"}
          </Typography>
        </motion.div>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links for non-authenticated users */}
        {!isAuthenticated && !isMobile && (
          <Box sx={{ display: "flex", gap: 2, mr: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{
                fontWeight:
                  isActivePath("/") && location.pathname === "/"
                    ? "bold"
                    : "normal",
              }}
            >
              Home
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/events"
              sx={{
                fontWeight: isActivePath("/events") ? "bold" : "normal",
              }}
            >
              Events
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/membership-plans"
              sx={{
                fontWeight: isActivePath("/membership-plans")
                  ? "bold"
                  : "normal",
              }}
            >
              Membership
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/about"
              sx={{
                fontWeight: isActivePath("/about") ? "bold" : "normal",
              }}
            >
              About
            </Button>
          </Box>
        )}

        {/* User Actions */}
        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              aria-label="notifications"
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Profile */}
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              aria-label="user profile"
            >
              <Avatar
                src={user?.profileImage}
                alt={user?.firstName}
                sx={{ width: 32, height: 32 }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>

            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.5)" }}
            >
              Login
            </Button>
            <Button
              color="secondary"
              component={Link}
              to="/register"
              variant="contained"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {user?.role === "admin" ? (
          <>
            <MenuItem onClick={() => handleNavigation("/admin")}>
              <Dashboard sx={{ mr: 1 }} />
              Admin Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/admin/users")}>
              <Person sx={{ mr: 1 }} />
              User Management
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/admin/events")}>
              <Event sx={{ mr: 1 }} />
              Event Management
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/dashboard/profile")}>
              <Person sx={{ mr: 1 }} />
              My Profile
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => handleNavigation("/dashboard")}>
              <Dashboard sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/dashboard/profile")}>
              <Person sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/dashboard/my-events")}>
              <Event sx={{ mr: 1 }} />
              My Events
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/create-event")}>
              <Event sx={{ mr: 1 }} />
              Create Event
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">New event invitation</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">Membership expiring soon</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Typography variant="body2">Payment confirmation</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
