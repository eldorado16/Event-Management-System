const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['membership', 'event_registration', 'refund', 'cancellation'],
    required: true
  },
  relatedItem: {
    itemType: {
      type: String,
      enum: ['Membership', 'Event'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedItem.itemType'
    }
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'online'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'manual']
  },
  gatewayTransactionId: {
    type: String
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  taxes: {
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    taxType: String
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    couponCode: String
  },
  netAmount: {
    type: Number,
    required: true
  },
  processedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    }
  },
  receipt: {
    receiptNumber: String,
    receiptUrl: String,
    issuedAt: Date
  },
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate transaction ID and calculate net amount
transactionSchema.pre('save', function(next) {
  // Generate transaction ID if not provided
  if (!this.transactionId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN${timestamp}${random}`;
  }

  // Calculate net amount
  const taxAmount = this.taxes?.amount || 0;
  const discountAmount = this.discount?.amount || 0;
  this.netAmount = this.amount + taxAmount - discountAmount;

  // Generate receipt number for completed transactions
  if (this.status === 'completed' && !this.receipt?.receiptNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.receipt = {
      receiptNumber: `RCP${date}${sequence}`,
      issuedAt: new Date()
    };
  }

  // Set processed date for completed/failed transactions
  if (['completed', 'failed'].includes(this.status) && !this.processedAt) {
    this.processedAt = new Date();
  }

  next();
});

// Method to check if transaction can be refunded
transactionSchema.methods.canBeRefunded = function() {
  return this.status === 'completed' && 
         !this.refundDetails?.refundId &&
         this.amount > 0;
};

// Method to process refund
transactionSchema.methods.processRefund = function(refundAmount, reason) {
  if (!this.canBeRefunded()) {
    throw new Error('Transaction cannot be refunded');
  }

  const maxRefundAmount = this.netAmount;
  const actualRefundAmount = Math.min(refundAmount || maxRefundAmount, maxRefundAmount);

  this.refundDetails = {
    refundId: `REF${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    refundAmount: actualRefundAmount,
    refundDate: new Date(),
    refundReason: reason,
    refundStatus: 'pending'
  };

  return this.refundDetails;
};

// Method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this.transactionId,
    amount: this.amount,
    netAmount: this.netAmount,
    status: this.status,
    type: this.type,
    paymentMethod: this.paymentMethod,
    date: this.createdAt,
    receiptNumber: this.receipt?.receiptNumber
  };
};

// Static method to get transaction statistics
transactionSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$netAmount' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$netAmount', 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedAmount: {
          $sum: { $cond: [{ $ne: ['$refundDetails.refundAmount', null] }, '$refundDetails.refundAmount', 0] }
        }
      }
    }
  ]);
};

// Indexes for efficient queries
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ 'relatedItem.itemType': 1, 'relatedItem.itemId': 1 });

module.exports = mongoose.model('Transaction', transactionSchema);