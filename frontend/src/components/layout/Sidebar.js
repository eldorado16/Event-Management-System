import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Collapse,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  Person,
  Event,
  CardMembership,
  Payment,
  Add,
  ManageAccounts,
  Analytics,
  Settings,
  ExpandLess,
  ExpandMore,
  People,
  EventNote,
  Assessment,
  Build,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [expandedItems, setExpandedItems] = useState({});

  const handleToggleExpand = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActivePath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Navigation items for regular users
  const userNavItems = [
    {
      title: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
    },
    {
      title: "Profile",
      icon: <Person />,
      path: "/dashboard/profile",
    },
    {
      title: "My Events",
      icon: <Event />,
      path: "/dashboard/my-events",
    },
    {
      title: "Membership",
      icon: <CardMembership />,
      path: "/dashboard/membership",
    },
    {
      title: "Create Event",
      icon: <Add />,
      path: "/create-event",
    },
  ];

  // Admin navigation items
  const adminNavItems = [
    {
      title: "Admin Dashboard",
      icon: <Dashboard />,
      path: "/admin",
    },
    {
      title: "User Management",
      icon: <People />,
      path: "/admin/users",
    },
    {
      title: "Event Management",
      icon: <EventNote />,
      path: "/admin/events",
    },
    {
      title: "Membership Management",
      icon: <CardMembership />,
      path: "/admin/memberships",
    },
    {
      title: "Reports",
      icon: <Assessment />,
      path: "/admin/reports",
    },
    {
      title: "Settings",
      icon: <Settings />,
      path: "/admin/settings",
    },
  ];

  const renderNavItem = (item, index) => {
    if (item.expandable) {
      return (
        <Box key={index}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleExpand(item.title)}>
              <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
              {expandedItems[item.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={expandedItems[item.title]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.items.map((subItem, subIndex) => (
                <ListItem key={subIndex} disablePadding>
                  <ListItemButton
                    sx={{
                      pl: 4,
                      backgroundColor: isActivePath(subItem.path)
                        ? theme.palette.action.selected
                        : "transparent",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                    onClick={() => handleNavigation(subItem.path)}
                  >
                    <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText primary={subItem.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem key={index} disablePadding>
        <ListItemButton
          sx={{
            backgroundColor: isActivePath(item.path)
              ? theme.palette.action.selected
              : "transparent",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
          onClick={() => handleNavigation(item.path)}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.title} />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto", height: "100%" }}>
      {/* User Info */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          backgroundColor: theme.palette.primary.main,
          color: "white",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6" noWrap>
            Welcome
          </Typography>
          <Typography variant="body2" noWrap>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" noWrap>
            {user?.role === "admin" ? "Administrator" : "Member"}
          </Typography>
        </motion.div>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List>
        {/* Regular user navigation */}
        {user?.role !== "admin" && (
          <>{userNavItems.map((item, index) => renderNavItem(item, index))}</>
        )}

        {/* Admin navigation */}
        {user?.role === "admin" && (
          <>{adminNavItems.map((item, index) => renderNavItem(item, index))}</>
        )}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          marginTop: isMobile ? 0 : "64px",
          height: isMobile ? "100%" : "calc(100% - 64px)",
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
