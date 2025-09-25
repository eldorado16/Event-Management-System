const express = require("express");
const User = require("../models/User");
const { authenticate, authorize, adminOnly } = require("../middleware/auth");
const {
  validateUserUpdate,
  validateObjectId,
  validatePagination,
} = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", adminOnly, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by role if specified
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status if specified
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === "true";
    }

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await User.find(query)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Own Profile
router.get("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user can access this profile (admin or own profile)
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this profile",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
router.put(
  "/:id",
  validateObjectId("id"),
  validateUserUpdate,
  async (req, res) => {
    try {
      // Check if user can update this profile (admin or own profile)
      if (
        req.user.role !== "admin" &&
        req.user._id.toString() !== req.params.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this profile",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Fields that can be updated
      const allowedUpdates = [
        "firstName",
        "lastName",
        "phone",
        "dateOfBirth",
        "address",
        "profileImage",
      ];

      // Only admins can update role and isActive
      if (req.user.role === "admin") {
        allowedUpdates.push("role", "isActive");
      }

      // Only allow users to update their own email, admins can update any
      if (
        req.user.role === "admin" ||
        req.user._id.toString() === req.params.id
      ) {
        allowedUpdates.push("email");
      }

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Check if email is being changed and if it's already taken
      if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({ email: updates.email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-password -resetPasswordToken -resetPasswordExpire");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", adminOnly, validateObjectId("id"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Change user password
// @route   PUT /api/users/:id/change-password
// @access  Private/Admin or Own Profile
router.put("/:id/change-password", validateObjectId("id"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Check if user can change this password (admin or own profile)
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to change this password",
      });
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // For non-admin users, verify current password
    if (req.user.role !== "admin") {
      const isCurrentPasswordCorrect = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
router.get("/stats/overview", adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const regularUsers = await User.countDocuments({ role: "user" });

    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
router.get("/dashboard/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    // Import models here to avoid circular dependency
    const Event = require("../models/Event");

    // Get user's event statistics
    const eventsCreated = await Event.countDocuments({ organizer: userId });
    const eventsRegistered = await Event.countDocuments({
      "registrations.user": userId,
    });

    // Get events attended (assuming we have an attendees field or registrations with status attended)
    const eventsAttended = await Event.countDocuments({
      registrations: {
        $elemMatch: {
          user: userId,
          status: "attended",
        },
      },
    });

    // Get upcoming events user is registered for
    const upcomingEvents = await Event.countDocuments({
      "registrations.user": userId,
      date: { $gte: new Date() },
    });

    res.json({
      eventsCreated,
      eventsRegistered,
      eventsAttended,
      upcomingEvents,
    });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get user dashboard activities
// @route   GET /api/users/dashboard/activities
// @access  Private
router.get("/dashboard/activities", async (req, res) => {
  try {
    const userId = req.user._id;

    // Return mock data for now - you can enhance this with real activity tracking
    const activities = [
      {
        id: 1,
        type: "event_created",
        description: "You created a new event",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: "event",
      },
      {
        id: 2,
        type: "event_registered",
        description: "You registered for Tech Conference 2024",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        icon: "registration",
      },
      {
        id: 3,
        type: "membership_purchased",
        description: "You purchased Premium membership",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        icon: "membership",
      },
    ];

    res.json(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get user's upcoming events
// @route   GET /api/users/dashboard/upcoming-events
// @access  Private
router.get("/dashboard/upcoming-events", async (req, res) => {
  try {
    const userId = req.user._id;
    const Event = require("../models/Event");

    const upcomingEvents = await Event.find({
      $or: [{ organizer: userId }, { "registrations.user": userId }],
      date: { $gte: new Date() },
    })
      .populate("organizer", "firstName lastName")
      .sort({ date: 1 })
      .limit(5);

    res.json(upcomingEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
