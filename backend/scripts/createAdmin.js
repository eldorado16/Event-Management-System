const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import User model
const User = require("../models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@eventmanagement.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@eventmanagement.com");
      console.log("Password: admin123");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const admin = new User({
      firstName: "System",
      lastName: "Administrator",
      email: "admin@eventmanagement.com",
      password: hashedPassword,
      role: "admin",
      phone: "1234567890",
      isActive: true,
      emailVerified: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@eventmanagement.com");
    console.log("🔐 Password: admin123");
    console.log("👑 Role: admin");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
const init = async () => {
  await connectDB();
  await createAdmin();
};

init();
