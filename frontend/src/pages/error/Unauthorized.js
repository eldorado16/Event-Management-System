import React from "react";
import { Container, Typography, Box, Button, Paper } from "@mui/material";
import { Lock, Home, ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Lock
                sx={{
                  fontSize: 80,
                  color: "error.main",
                  mb: 3,
                }}
              />
            </motion.div>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
              color="error.main"
            >
              Access Denied
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 3 }}
            >
              You don't have permission to access this page
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 400 }}
            >
              This page requires administrator privileges. Please contact your
              system administrator if you believe you should have access to this
              content.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{ borderRadius: 2 }}
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ borderRadius: 2 }}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Unauthorized;
