import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import {
  Event,
  People,
  TrendingUp,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

// Placeholder data for events
const upcomingEvents = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    date: '2024-12-15',
    time: '09:00 AM',
    location: 'Convention Center, Downtown',
    attendees: 150,
    maxAttendees: 200,
    category: 'Conference',
    description: 'Join the biggest tech conference of the year featuring industry leaders and innovative technologies.',
  },
  {
    id: 2,
    title: 'Workshop: React Advanced Patterns',
    date: '2024-12-20',
    time: '02:00 PM',
    location: 'Tech Hub, Silicon Valley',
    attendees: 25,
    maxAttendees: 30,
    category: 'Workshop',
    description: 'Deep dive into advanced React patterns and best practices for scalable applications.',
  },
  {
    id: 3,
    title: 'Networking Night',
    date: '2024-12-22',
    time: '06:00 PM',
    location: 'Rooftop Lounge, City Center',
    attendees: 75,
    maxAttendees: 100,
    category: 'Networking',
    description: 'Connect with professionals from various industries in a relaxed atmosphere.',
  },
];

const Events = () => {
  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Upcoming Events
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Discover and join amazing events happening in your community.
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Find Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search and filter functionality will be implemented here.
            For now, browse our featured upcoming events below.
          </Typography>
        </Paper>

        {/* Events Grid */}
        <Grid container spacing={3}>
          {upcomingEvents.map((event, index) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={event.category}
                        color="primary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                        {event.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="body2">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                      <LocationOn sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                      <People sx={{ fontSize: 16, mr: 1 }} />
                      <Typography variant="body2">
                        {event.attendees}/{event.maxAttendees} attendees
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        component={RouterLink}
                        to={`/events/${event.id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Empty State for when no events */}
        {upcomingEvents.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No events found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              There are no upcoming events at the moment. Check back later or create your own event!
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/events/create"
              sx={{ mt: 2 }}
            >
              Create Event
            </Button>
          </Box>
        )}

        {/* Load More Button */}
        {upcomingEvents.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" size="large">
              Load More Events
            </Button>
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default Events;