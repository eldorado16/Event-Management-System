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

// Create additional test users
const createTestUsers = async () => {
  try {
    const testUsers = [
      {
        firstName: "John",
        lastName: "Admin",
        email: "john.admin@example.com",
        password: "admin123",
        role: "admin",
        phone: "9876543210",
      },
      {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.user@example.com",
        password: "user123",
        role: "user",
        phone: "8765432109",
      },
      {
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.user@example.com",
        password: "user123",
        role: "user",
        phone: "7654321098",
      },
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists!`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
        isActive: true,
        emailVerified: true,
      });

      await user.save();
      console.log(
        `✅ ${userData.role.toUpperCase()} user created: ${userData.email}`
      );
    }

    console.log("\n🎉 All test users processed successfully!");
    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("==========================================");
    console.log("🔥 ADMIN ACCOUNTS:");
    console.log("📧 admin@eventmanagement.com | 🔐 admin123");
    console.log("📧 john.admin@example.com | 🔐 admin123");
    console.log("");
    console.log("👤 USER ACCOUNTS:");
    console.log("📧 jane.user@example.com | 🔐 user123");
    console.log("📧 bob.user@example.com | 🔐 user123");
    console.log("==========================================");
  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the script
const init = async () => {
  await connectDB();
  await createTestUsers();
};

init();
