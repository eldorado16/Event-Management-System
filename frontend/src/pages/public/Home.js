import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Event,
  People,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: <Event sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Event Management',
      description: 'Create, manage, and organize events with ease. From small meetups to large conferences.',
    },
    {
      icon: <People sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Community Building',
      description: 'Connect with like-minded individuals and build lasting professional relationships.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Analytics & Reports',
      description: 'Track your event performance with detailed analytics and comprehensive reports.',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Premium Features',
      description: 'Access exclusive features with our membership plans designed for power users.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              align="center"
              fontWeight="bold"
            >
              Event Management System
            </Typography>
            <Typography
              variant="h5"
              align="center"
              paragraph
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Your premier destination for organizing and attending amazing events.
              Connect, learn, and grow with our community.
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={RouterLink}
                to="/events"
                sx={{ px: 4, py: 1.5 }}
              >
                Browse Events
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          fontWeight="bold"
          sx={{ mb: 6 }}
        >
          Why Choose Our Platform?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          py: 6,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h4"
              component="h2"
              align="center"
              gutterBottom
              fontWeight="bold"
            >
              Ready to Get Started?
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              Join thousands of event organizers and attendees who trust our platform
              for their event management needs.
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{ px: 4, py: 1.5 }}
              >
                Create Account
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/membership-plans"
                sx={{ px: 4, py: 1.5 }}
              >
                View Membership Plans
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;