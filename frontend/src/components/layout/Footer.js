import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Event Management System
              </Typography>
              <Typography variant="body2" paragraph>
                Your premier destination for organizing and attending amazing events. 
                Connect, learn, and grow with our community.
              </Typography>
              <Box display="flex" gap={1}>
                <IconButton color="inherit" aria-label="Facebook">
                  <Facebook />
                </IconButton>
                <IconButton color="inherit" aria-label="Twitter">
                  <Twitter />
                </IconButton>
                <IconButton color="inherit" aria-label="LinkedIn">
                  <LinkedIn />
                </IconButton>
                <IconButton color="inherit" aria-label="Instagram">
                  <Instagram />
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Links
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Link href="/" color="inherit" underline="hover">
                  Home
                </Link>
                <Link href="/events" color="inherit" underline="hover">
                  Events
                </Link>
                <Link href="/membership-plans" color="inherit" underline="hover">
                  Membership
                </Link>
                <Link href="/about" color="inherit" underline="hover">
                  About Us
                </Link>
                <Link href="/contact" color="inherit" underline="hover">
                  Contact
                </Link>
              </Box>
            </motion.div>
          </Grid>

          {/* Services */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Services
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Link href="#" color="inherit" underline="hover">
                  Event Planning
                </Link>
                <Link href="#" color="inherit" underline="hover">
                  Venue Booking
                </Link>
                <Link href="#" color="inherit" underline="hover">
                  Registration Management
                </Link>
                <Link href="#" color="inherit" underline="hover">
                  Payment Processing
                </Link>
                <Link href="#" color="inherit" underline="hover">
                  Analytics & Reports
                </Link>
              </Box>
            </motion.div>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Contact Info
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Email fontSize="small" />
                  <Typography variant="body2">
                    info@eventmanagement.com
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone fontSize="small" />
                  <Typography variant="body2">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">
                    123 Event Street, City, State 12345
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={{ xs: 'column', md: 'row' }}
          gap={2}
        >
          <Typography variant="body2">
            © {currentYear} Event Management System. All rights reserved.
          </Typography>
          <Box display="flex" gap={2}>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="#" color="inherit" underline="hover" variant="body2">
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;