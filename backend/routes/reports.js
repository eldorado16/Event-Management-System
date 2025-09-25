const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validateDateRange } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and admin-only access to all routes
router.use(authenticate, adminOnly);

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Event statistics
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const upcomingEvents = await Event.countDocuments({
      status: 'published',
      startDate: { $gte: today }
    });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    
    // Membership statistics
    const totalMemberships = await Membership.countDocuments();
    const activeMemberships = await Membership.countDocuments({ status: 'active' });
    const expiringMemberships = await Membership.countDocuments({
      status: 'active',
      endDate: { $lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), $gt: today }
    });
    
    // Revenue statistics
    const revenueStats = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$netAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', thirtyDaysAgo] },
                '$netAmount',
                0
              ]
            }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);
    
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      monthlyRevenue: 0,
      transactionCount: 0
    };
    
    // Recent activity
    const recentEvents = await Event.find()
      .populate('organizer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status startDate currentAttendees maxAttendees');
    
    const recentTransactions = await Transaction.find()
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('transactionId type amount status createdAt');
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          newThisMonth: newUsersThisMonth
        },
        events: {
          total: totalEvents,
          published: publishedEvents,
          upcoming: upcomingEvents,
          completed: completedEvents,
          draft: totalEvents - publishedEvents - completedEvents
        },
        memberships: {
          total: totalMemberships,
          active: activeMemberships,
          expiring: expiringMemberships
        },
        revenue,
        recentActivity: {
          events: recentEvents,
          transactions: recentTransactions
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user analytics
// @route   GET /api/reports/users
// @access  Private/Admin
router.get('/users', validateDateRange, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // User registration trends
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // User activity by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Top active users (by event participation)
    const topActiveUsers = await Event.aggregate([
      { $unwind: '$registeredUsers' },
      {
        $group: {
          _id: '$registeredUsers.user',
          eventCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          eventCount: 1
        }
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        registrationTrends,
        usersByRole,
        topActiveUsers,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get event analytics
// @route   GET /api/reports/events
// @access  Private/Admin
router.get('/events', validateDateRange, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Event creation trends
    const eventTrends = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Events by category
    const eventsByCategory = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAttendees: { $sum: '$currentAttendees' },
          avgAttendees: { $avg: '$currentAttendees' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Events by status
    const eventsByStatus = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAttendees: { $sum: '$currentAttendees' }
        }
      }
    ]);
    
    // Top performing events
    const topEvents = await Event.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('organizer', 'firstName lastName')
    .sort({ currentAttendees: -1 })
    .limit(10)
    .select('title category currentAttendees maxAttendees startDate status averageRating');
    
    // Event attendance rate
    const attendanceStats = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          maxAttendees: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgAttendanceRate: {
            $avg: { $multiply: [{ $divide: ['$currentAttendees', '$maxAttendees'] }, 100] }
          },
          totalCapacity: { $sum: '$maxAttendees' },
          totalAttendees: { $sum: '$currentAttendees' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        eventTrends,
        eventsByCategory,
        eventsByStatus,
        topEvents,
        attendanceStats: attendanceStats[0] || {
          avgAttendanceRate: 0,
          totalCapacity: 0,
          totalAttendees: 0
        },
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get revenue analytics
// @route   GET /api/reports/revenue
// @access  Private/Admin
router.get('/revenue', validateDateRange, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Revenue trends
    const revenueTrends = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Revenue by type
    const revenueByType = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          revenue: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 },
          avgTransactionValue: { $avg: '$netAmount' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);
    
    // Revenue by payment method
    const revenueByPaymentMethod = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$netAmount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);
    
    // Membership revenue breakdown
    const membershipRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          type: 'membership',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'memberships',
          localField: 'relatedItem.itemId',
          foreignField: '_id',
          as: 'membership'
        }
      },
      { $unwind: '$membership' },
      {
        $group: {
          _id: '$membership.membershipType',
          revenue: { $sum: '$netAmount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Overall revenue statistics
    const overallStats = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$netAmount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$netAmount' },
          maxTransactionValue: { $max: '$netAmount' },
          minTransactionValue: { $min: '$netAmount' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        revenueTrends,
        revenueByType,
        revenueByPaymentMethod,
        membershipRevenue,
        overallStats: overallStats[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          avgTransactionValue: 0,
          maxTransactionValue: 0,
          minTransactionValue: 0
        },
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get membership analytics
// @route   GET /api/reports/memberships
// @access  Private/Admin
router.get('/memberships', validateDateRange, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Membership creation trends
    const membershipTrends = await Membership.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Memberships by type
    const membershipsByType = await Membership.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$membershipType',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          avgDuration: { $avg: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000 * 60 * 60 * 24] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Membership status distribution
    const membershipsByStatus = await Membership.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      }
    ]);
    
    // Retention analysis
    const retentionAnalysis = await Membership.aggregate([
      {
        $match: {
          status: { $in: ['active', 'expired'] }
        }
      },
      {
        $group: {
          _id: '$user',
          membershipCount: { $sum: 1 },
          totalSpent: { $sum: '$amount' },
          firstMembership: { $min: '$createdAt' },
          lastMembership: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          renewedUsers: {
            $sum: { $cond: [{ $gt: ['$membershipCount', 1] }, 1, 0] }
          },
          avgMembershipsPerUser: { $avg: '$membershipCount' },
          avgLifetimeValue: { $avg: '$totalSpent' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        membershipTrends,
        membershipsByType,
        membershipsByStatus,
        retentionAnalysis: retentionAnalysis[0] || {
          totalUsers: 0,
          renewedUsers: 0,
          avgMembershipsPerUser: 0,
          avgLifetimeValue: 0
        },
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get membership analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Export data (placeholder for CSV/Excel export)
// @route   GET /api/reports/export/:type
// @access  Private/Admin
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;
    
    // This is a placeholder for export functionality
    // In a real application, you would implement CSV/Excel export here
    
    let data = {};
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    switch (type) {
      case 'users':
        data = await User.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
          .select('-password -resetPasswordToken -resetPasswordExpire');
        break;
      case 'events':
        data = await Event.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
          .populate('organizer', 'firstName lastName email');
        break;
      case 'memberships':
        data = await Membership.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
          .populate('user', 'firstName lastName email');
        break;
      case 'transactions':
        data = await Transaction.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
          .populate('user', 'firstName lastName email');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
    res.status(200).json({
      success: true,
      message: `${type} data exported successfully`,
      data,
      count: data.length,
      exportType: type,
      format,
      exportedAt: new Date()
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;