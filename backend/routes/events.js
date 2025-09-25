const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticate, authorize, adminOnly } = require('../middleware/auth');
const { 
  validateEventCreation, 
  validateEventUpdate, 
  validateObjectId, 
  validatePagination,
  validateDateRange 
} = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes except public event listing
router.use((req, res, next) => {
  // Allow public access to GET /api/events (list events)
  if (req.method === 'GET' && req.path === '/') {
    return next();
  }
  // All other routes require authentication
  authenticate(req, res, next);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', validatePagination, validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { status: 'published' };
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by event type
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.startDate = {};
      if (req.query.startDate) {
        query.startDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.startDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search by title or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    // Filter by location
    if (req.query.city) {
      query['venue.address.city'] = new RegExp(req.query.city, 'i');
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone')
      .populate('registeredUsers.user', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // If user is not authenticated or not the organizer/admin, hide sensitive info
    let responseEvent = event.toObject();
    if (!req.user || (req.user.role !== 'admin' && event.organizer._id.toString() !== req.user._id.toString())) {
      // Remove sensitive information for non-organizers
      delete responseEvent.registeredUsers;
      delete responseEvent.onlineDetails;
    }
    
    res.status(200).json({
      success: true,
      data: { event: responseEvent }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
router.post('/', validateEventCreation, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      status: req.body.status || 'draft'
    };
    
    const event = await Event.create(eventData);
    await event.populate('organizer', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer or Admin)
router.put('/:id', validateObjectId('id'), validateEventUpdate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Don't allow updates to completed or cancelled events unless admin
    if (req.user.role !== 'admin' && ['completed', 'cancelled'].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or cancelled events'
      });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer or Admin)
router.delete('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is organizer or admin
    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    // Don't allow deletion if there are registered users (unless admin)
    if (req.user.role !== 'admin' && event.registeredUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with registered attendees'
      });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }
    
    // Check if event is in the future
    if (event.startDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }
    
    // Check if user is already registered
    if (event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }
    
    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    // Add user to registered users
    event.registeredUsers.push({
      user: req.user._id,
      paymentStatus: event.registrationFee > 0 ? 'pending' : 'completed'
    });
    
    event.currentAttendees += 1;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        eventId: event._id,
        registrationDate: new Date(),
        paymentRequired: event.registrationFee > 0
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
router.delete('/:id/register', validateObjectId('id'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is registered
    if (!event.isUserRegistered(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    // Check if event hasn't started yet
    const oneDayBeforeEvent = new Date(event.startDate);
    oneDayBeforeEvent.setDate(oneDayBeforeEvent.getDate() - 1);
    
    if (new Date() > oneDayBeforeEvent) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unregister less than 24 hours before the event'
      });
    }
    
    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(
      registration => registration.user.toString() !== req.user._id.toString()
    );
    
    event.currentAttendees -= 1;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's registered events
// @route   GET /api/events/my-events
// @access  Private
router.get('/user/my-events', async (req, res) => {
  try {
    const events = await Event.find({
      'registeredUsers.user': req.user._id
    })
    .populate('organizer', 'firstName lastName email')
    .sort({ startDate: 1 });
    
    // Filter to show only user's registration details
    const userEvents = events.map(event => {
      const eventObj = event.toObject();
      const userRegistration = eventObj.registeredUsers.find(
        reg => reg.user.toString() === req.user._id.toString()
      );
      
      return {
        ...eventObj,
        userRegistration,
        registeredUsers: undefined // Remove all registrations for privacy
      };
    });
    
    res.status(200).json({
      success: true,
      data: { events: userEvents }
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get events organized by user
// @route   GET /api/events/my-organized-events
// @access  Private
router.get('/user/organized', async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('registeredUsers.user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: { events }
    });
  } catch (error) {
    console.error('Get organized events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;