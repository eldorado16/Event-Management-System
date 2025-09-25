const express = require('express');
const Transaction = require('../models/Transaction');
const Event = require('../models/Event');
const Membership = require('../models/Membership');
const User = require('../models/User');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validateObjectId, validatePagination, validateDateRange } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @desc    Get all transactions (Admin only)
// @route   GET /api/transactions
// @access  Private/Admin
router.get('/', adminOnly, validatePagination, validateDateRange, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by payment method
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filter by user
    if (req.query.userId) {
      query.user = req.query.userId;
    }
    
    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName email')
      .populate('relatedItem.itemId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private (Owner or Admin)
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('relatedItem.itemId')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Check if user can access this transaction (admin or owner)
    if (req.user.role !== 'admin' && transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update transaction (Admin only)
// @route   PUT /api/transactions/:id
// @access  Private/Admin
router.put('/:id', adminOnly, validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Fields that can be updated by admin
    const allowedUpdates = [
      'status',
      'paymentMethod',
      'gatewayTransactionId',
      'description',
      'notes',
      'failureReason'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    updates.updatedBy = req.user._id;
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Process refund (Admin only)
// @route   POST /api/transactions/:id/refund
// @access  Private/Admin
router.post('/:id/refund', adminOnly, validateObjectId('id'), async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    if (!transaction.canBeRefunded()) {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be refunded'
      });
    }
    
    try {
      const refundDetails = transaction.processRefund(refundAmount, reason);
      transaction.updatedBy = req.user._id;
      await transaction.save();
      
      // Create a new refund transaction
      const refundTransaction = await Transaction.create({
        user: transaction.user,
        type: 'refund',
        relatedItem: transaction.relatedItem,
        amount: refundDetails.refundAmount,
        paymentMethod: transaction.paymentMethod,
        status: 'completed',
        description: `Refund for transaction ${transaction.transactionId}`,
        metadata: {
          originalTransactionId: transaction.transactionId,
          refundReason: reason
        },
        createdBy: req.user._id
      });
      
      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          originalTransaction: transaction,
          refundTransaction: refundTransaction.getSummary()
        }
      });
    } catch (refundError) {
      return res.status(400).json({
        success: false,
        message: refundError.message
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get current user's transactions
// @route   GET /api/transactions/my-transactions
// @access  Private
router.get('/user/history', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { user: req.user._id };
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const transactions = await Transaction.find(query)
      .populate('relatedItem.itemId', 'title membershipType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments(query);
    
    // Transform transactions to include summary info
    const transactionHistory = transactions.map(transaction => ({
      ...transaction.toObject(),
      summary: transaction.getSummary()
    }));
    
    res.status(200).json({
      success: true,
      data: {
        transactions: transactionHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get transaction statistics (Admin only)
// @route   GET /api/transactions/stats
// @access  Private/Admin
router.get('/admin/stats', adminOnly, validateDateRange, async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const endDate = req.query.endDate || new Date();
    
    // Get overall statistics
    const stats = await Transaction.getStatistics(startDate, endDate);
    
    // Get statistics by type
    const statsByType = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$netAmount', 0] }
          }
        }
      }
    ]);
    
    // Get statistics by payment method
    const statsByPaymentMethod = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' }
        }
      }
    ]);
    
    // Get daily transaction data for charts
    const dailyStats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$netAmount', 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          completedTransactions: 0,
          completedAmount: 0,
          failedTransactions: 0,
          refundedAmount: 0
        },
        byType: statsByType,
        byPaymentMethod: statsByPaymentMethod,
        dailyStats,
        dateRange: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get recent transactions (Admin only)
// @route   GET /api/transactions/recent
// @access  Private/Admin
router.get('/admin/recent', adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const recentTransactions = await Transaction.find()
      .populate('user', 'firstName lastName email')
      .populate('relatedItem.itemId', 'title membershipType')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      data: { transactions: recentTransactions }
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get pending transactions (Admin only)
// @route   GET /api/transactions/pending
// @access  Private/Admin
router.get('/admin/pending', adminOnly, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const pendingTransactions = await Transaction.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .populate('relatedItem.itemId', 'title membershipType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Transaction.countDocuments({ status: 'pending' });
    
    res.status(200).json({
      success: true,
      data: {
        transactions: pendingTransactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;