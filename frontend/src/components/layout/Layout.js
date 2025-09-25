import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar onSidebarToggle={handleSidebarToggle} />
      
      <Box display="flex" flex={1}>
        {isAuthenticated && (
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          />
        )}
        
        <Box
          component="main"
          flex={1}
          sx={{
            ml: isAuthenticated && !isMobile && sidebarOpen ? '240px' : 0,
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="xl" sx={{ py: 3, minHeight: 'calc(100vh - 120px)' }}>
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </Container>
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;