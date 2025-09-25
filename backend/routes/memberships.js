const express = require("express");
const Membership = require("../models/Membership");
const Transaction = require("../models/Transaction");
const { authenticate, adminOnly } = require("../middleware/auth");
const {
  validateMembershipCreation,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @desc    Get all memberships (Admin only)
// @route   GET /api/memberships
// @access  Private/Admin
router.get("/", adminOnly, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by membership type
    if (req.query.membershipType) {
      query.membershipType = req.query.membershipType;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    const memberships = await Membership.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Membership.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        memberships,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get memberships error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get single membership
// @route   GET /api/memberships/:id
// @access  Private (Owner or Admin)
router.get("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate("user", "firstName lastName email phone")
      .populate("createdBy", "firstName lastName")
      .populate("updatedBy", "firstName lastName");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Check if user can access this membership (admin or owner)
    if (
      req.user.role !== "admin" &&
      membership.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this membership",
      });
    }

    res.status(200).json({
      success: true,
      data: { membership },
    });
  } catch (error) {
    console.error("Get membership error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Create new membership
// @route   POST /api/memberships
// @access  Private
router.post("/", validateMembershipCreation, async (req, res) => {
  try {
    const { membershipType, paymentMethod, autoRenewal, notes } = req.body;

    // Check if user already has an active membership
    const existingMembership = await Membership.findOne({
      user: req.user._id,
      status: "active",
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: "You already have an active membership",
      });
    }

    // Get pricing for membership type
    const pricing = Membership.getPricing();
    const amount = pricing[membershipType];

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership type",
      });
    }

    // Create membership
    const membershipData = {
      user: req.user._id,
      membershipType,
      amount,
      paymentMethod,
      autoRenewal: autoRenewal || false,
      notes,
      createdBy: req.user._id,
      benefits: Membership.getBenefits(membershipType),
    };

    const membership = await Membership.create(membershipData);

    // Create transaction record
    const transactionData = {
      user: req.user._id,
      type: "membership",
      relatedItem: {
        itemType: "Membership",
        itemId: membership._id,
      },
      amount: amount,
      paymentMethod,
      description: `${membershipType} membership purchase`,
      createdBy: req.user._id,
    };

    const transaction = await Transaction.create(transactionData);

    // Update membership with transaction ID
    membership.transactionId = transaction.transactionId;
    await membership.save();

    await membership.populate("user", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Membership created successfully",
      data: {
        membership,
        transaction: transaction.getSummary(),
      },
    });
  } catch (error) {
    console.error("Create membership error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Update membership
// @route   PUT /api/memberships/:id
// @access  Private/Admin
router.put("/:id", adminOnly, validateObjectId("id"), async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Fields that can be updated by admin
    const allowedUpdates = [
      "status",
      "paymentStatus",
      "autoRenewal",
      "notes",
      "discountPercentage",
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    updates.updatedBy = req.user._id;

    const updatedMembership = await Membership.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Membership updated successfully",
      data: { membership: updatedMembership },
    });
  } catch (error) {
    console.error("Update membership error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Cancel membership
// @route   DELETE /api/memberships/:id
// @access  Private (Owner or Admin)
router.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Check if user can cancel this membership (admin or owner)
    if (
      req.user.role !== "admin" &&
      membership.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this membership",
      });
    }

    // Update membership status to cancelled instead of deleting
    membership.status = "cancelled";
    membership.updatedBy = req.user._id;
    await membership.save();

    res.status(200).json({
      success: true,
      message: "Membership cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel membership error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get current user's membership
// @route   GET /api/memberships/current
// @access  Private
router.get("/current", async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
      status: "active",
    }).populate("user", "firstName lastName email");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "No active membership found",
      });
    }

    res.status(200).json(membership);
  } catch (error) {
    console.error("Get current membership error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Purchase membership
// @route   POST /api/memberships/purchase
// @access  Private
router.post("/purchase", async (req, res) => {
  try {
    const { planId, planName, duration, amount } = req.body;
    const userId = req.user._id;

    // Check if user already has an active membership
    const existingMembership = await Membership.findOne({
      user: userId,
      status: "active",
    });

    if (existingMembership) {
      return res
        .status(400)
        .json({ message: "You already have an active membership" });
    }

    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();

    switch (duration) {
      case "6 months":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "1 year":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "2 years":
        endDate.setFullYear(endDate.getFullYear() + 2);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 6);
    }

    // Create membership record
    const membership = new Membership({
      user: userId,
      membershipType: planId,
      planName,
      duration,
      amount,
      startDate,
      endDate,
      status: "active",
      paymentStatus: "completed",
    });

    await membership.save();

    // Create transaction record
    const transaction = new Transaction({
      user: userId,
      type: "membership_purchase",
      amount,
      description: `${planName} membership purchase`,
      status: "completed",
      paymentMethod: "credit_card",
      relatedId: membership._id,
    });

    await transaction.save();

    await membership.populate("user", "firstName lastName email");

    res.status(201).json({
      message: "Membership purchased successfully",
      membership,
      transaction,
    });
  } catch (error) {
    console.error("Error purchasing membership:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get membership history for current user
// @route   GET /api/memberships/my-history
// @access  Private
router.get("/user/history", validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const memberships = await Membership.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Membership.countDocuments({ user: req.user._id });

    // Add calculated fields
    const membershipHistory = memberships.map((membership) => ({
      ...membership.toObject(),
      isActive: membership.isActive(),
      remainingDays: membership.getRemainingDays(),
      durationInDays: membership.getDurationInDays(),
    }));

    res.status(200).json({
      success: true,
      data: {
        memberships: membershipHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get membership history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get membership pricing and benefits
// @route   GET /api/memberships/pricing
// @access  Public
router.get("/info/pricing", (req, res) => {
  try {
    const pricing = Membership.getPricing();
    const membershipInfo = Object.keys(pricing).map((type) => ({
      type,
      price: pricing[type],
      benefits: Membership.getBenefits(type),
      duration: {
        "6months": "6 Months",
        "1year": "1 Year",
        "2years": "2 Years",
      }[type],
    }));

    res.status(200).json({
      success: true,
      data: { membershipInfo },
    });
  } catch (error) {
    console.error("Get membership pricing error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get membership statistics (Admin only)
// @route   GET /api/memberships/stats
// @access  Private/Admin
router.get("/admin/stats", adminOnly, async (req, res) => {
  try {
    const totalMemberships = await Membership.countDocuments();
    const activeMemberships = await Membership.countDocuments({
      status: "active",
    });
    const expiredMemberships = await Membership.countDocuments({
      status: "expired",
    });
    const cancelledMemberships = await Membership.countDocuments({
      status: "cancelled",
    });

    // Memberships by type
    const membershipsByType = await Membership.aggregate([
      {
        $group: {
          _id: "$membershipType",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    // Expiring memberships (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringMemberships = await Membership.countDocuments({
      status: "active",
      endDate: { $lte: thirtyDaysFromNow, $gt: new Date() },
    });

    // Recent memberships (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMemberships = await Membership.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        totalMemberships,
        activeMemberships,
        expiredMemberships,
        cancelledMemberships,
        expiringMemberships,
        recentMemberships,
        membershipsByType,
      },
    });
  } catch (error) {
    console.error("Get membership stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
