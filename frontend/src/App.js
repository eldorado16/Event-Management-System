import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import { useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";

// Layout Components
import Layout from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Public Pages
import Home from "./pages/public/Home";
import Events from "./pages/public/Events";

// User Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/user/Profile";
import MyEvents from "./pages/user/MyEvents";
import Membership from "./pages/user/Membership";

// Event Management Pages
import CreateEvent from "./pages/events/CreateEvent";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import EventManagement from "./pages/admin/EventManagement";
import AdminMembership from "./pages/admin/AdminMembership";

// Error Pages
import Unauthorized from "./pages/error/Unauthorized";

function App() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
        </Route>

        {/* Auth Routes - Only accessible when not authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="membership" element={<Membership />} />
        </Route>

        {/* Event Management Routes */}
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CreateEvent />} />
        </Route>

        {/* Admin Routes - Require admin role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="memberships" element={<AdminMembership />} />
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch all route - 404 */}
        <Route
          path="*"
          element={
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="50vh"
              textAlign="center"
            >
              <h2>Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </Box>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
