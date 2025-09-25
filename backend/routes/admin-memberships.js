const express = require("express");
const { authenticate, adminOnly } = require("../middleware/auth");
const Membership = require("../models/Membership");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(adminOnly);

// Get all memberships (Admin)
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const memberships = await Membership.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Membership.countDocuments(query);

    res.json({
      memberships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get membership statistics
router.get("/stats", async (req, res) => {
  try {
    const totalMembers = await Membership.countDocuments();
    const activeMembers = await Membership.countDocuments({ status: "active" });

    // Calculate total revenue
    const revenueResult = await Membership.aggregate([
      { $match: { status: { $in: ["active", "expired"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate monthly revenue (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyRevenueResult = await Membership.aggregate([
      {
        $match: {
          createdAt: { $gte: currentMonth, $lt: nextMonth },
          status: { $in: ["active", "expired"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthlyRevenue =
      monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    res.json({
      totalMembers,
      activeMembers,
      totalRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching membership stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update membership status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    membership.status = status;
    if (status === "cancelled") {
      membership.cancelledAt = new Date();
    }

    await membership.save();
    await membership.populate("userId", "firstName lastName email");

    res.json({ message: "Membership updated successfully", membership });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete membership
router.delete("/:id", async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    // Also delete related transactions
    await Transaction.deleteMany({ membershipId: membership._id });
    await Membership.findByIdAndDelete(req.params.id);

    res.json({ message: "Membership deleted successfully" });
  } catch (error) {
    console.error("Error deleting membership:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create membership for user (Admin)
router.post("/create", async (req, res) => {
  try {
    const { userId, planId, planName, duration, amount } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has an active membership
    const existingMembership = await Membership.findOne({
      userId,
      status: "active",
    });

    if (existingMembership) {
      return res
        .status(400)
        .json({ message: "User already has an active membership" });
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
      userId,
      planId,
      planName,
      duration,
      amount,
      startDate,
      endDate,
      status: "active",
      createdBy: req.user.id,
    });

    await membership.save();

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: "membership",
      amount,
      description: `${planName} membership created by admin`,
      status: "completed",
      paymentMethod: "admin",
      membershipId: membership._id,
    });

    await transaction.save();

    await membership.populate("userId", "firstName lastName email");

    res.status(201).json({
      message: "Membership created successfully",
      membership,
      transaction,
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
