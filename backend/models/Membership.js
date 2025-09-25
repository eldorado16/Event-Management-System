const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipType: {
    type: String,
    enum: ['6months', '1year', '2years'],
    required: [true, 'Membership type is required']
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'online'],
    default: 'card'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  benefits: [{
    type: String
  }],
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  renewalDate: {
    type: Date
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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

// Pre-save middleware to calculate end date based on membership type
membershipSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('membershipType') || this.isModified('startDate')) {
    const startDate = new Date(this.startDate);
    let endDate;

    switch (this.membershipType) {
      case '6months':
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 6);
        this.amount = this.amount || 299; // Default price for 6 months
        break;
      case '1year':
        endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);
        this.amount = this.amount || 499; // Default price for 1 year
        break;
      case '2years':
        endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 2);
        this.amount = this.amount || 899; // Default price for 2 years
        break;
      default:
        return next(new Error('Invalid membership type'));
    }

    this.endDate = endDate;
    this.renewalDate = new Date(endDate);
    this.renewalDate.setDate(endDate.getDate() - 30); // Set renewal reminder 30 days before expiry
  }
  next();
});

// Method to check if membership is active
membershipSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Method to check if membership is expiring soon (within 30 days)
membershipSchema.methods.isExpiringSoon = function() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.endDate <= thirtyDaysFromNow && this.endDate > new Date();
};

// Method to get membership duration in days
membershipSchema.methods.getDurationInDays = function() {
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to get remaining days
membershipSchema.methods.getRemainingDays = function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  if (endDate < today) return 0;
  const diffTime = Math.abs(endDate - today);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static method to get membership pricing
membershipSchema.statics.getPricing = function() {
  return {
    '6months': 299,
    '1year': 499,
    '2years': 899
  };
};

// Static method to get membership benefits
membershipSchema.statics.getBenefits = function(type) {
  const benefits = {
    '6months': [
      'Access to all events',
      'Basic member support',
      'Monthly newsletter',
      '10% discount on paid events'
    ],
    '1year': [
      'Access to all events',
      'Priority member support',
      'Monthly newsletter',
      '15% discount on paid events',
      'Access to member-only events',
      'Free workshop access'
    ],
    '2years': [
      'Access to all events',
      'Premium member support',
      'Monthly newsletter',
      '25% discount on paid events',
      'Access to member-only events',
      'Free workshop access',
      'VIP event access',
      'Personal event concierge'
    ]
  };
  return benefits[type] || [];
};

// Index for efficient queries
membershipSchema.index({ user: 1, status: 1 });
membershipSchema.index({ endDate: 1 });
membershipSchema.index({ membershipType: 1 });

module.exports = mongoose.model('Membership', membershipSchema);