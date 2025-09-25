const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: [
        "Conference",
        "Workshop",
        "Seminar",
        "Networking",
        "Training",
        "Social",
        "Sports",
        "Cultural",
        "Other",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Venue name is required"],
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      capacity: {
        type: Number,
        min: [1, "Capacity must be at least 1"],
      },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    speakers: [
      {
        name: {
          type: String,
          required: true,
        },
        bio: String,
        image: String,
        designation: String,
        company: String,
      },
    ],
    registrationFee: {
      type: Number,
      default: 0,
      min: [0, "Registration fee cannot be negative"],
    },
    maxAttendees: {
      type: Number,
      required: [true, "Maximum attendees is required"],
      min: [1, "Maximum attendees must be at least 1"],
    },
    currentAttendees: {
      type: Number,
      default: 0,
    },
    registeredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registrationDate: {
          type: Date,
          default: Date.now,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        attendanceStatus: {
          type: String,
          enum: ["registered", "attended", "absent"],
          default: "registered",
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    eventType: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      default: "offline",
    },
    onlineDetails: {
      platform: String,
      meetingId: String,
      meetingPassword: String,
      meetingLink: String,
    },
    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: End date should be after start date
eventSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

// Calculate average rating
eventSchema.methods.calculateAverageRating = function () {
  if (this.feedback.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.feedback.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    this.averageRating = Math.round((sum / this.feedback.length) * 10) / 10;
  }
};

// Check if event is full
eventSchema.methods.isFull = function () {
  return this.currentAttendees >= this.maxAttendees;
};

// Check if user is registered
eventSchema.methods.isUserRegistered = function (userId) {
  return this.registeredUsers.some(
    (registration) => registration.user.toString() === userId.toString()
  );
};

module.exports = mongoose.model("Event", eventSchema);
