const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createAdminUser } = require("../controllers/authController");

dotenv.config();

let connectionInstance;

const connectDB = async () => {
  try {
    const dbURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/finance_tracker";

    connectionInstance = await mongoose.connect(dbURI);

    console.log("MongoDB connected successfully!");

    await createAdminUser();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }

  return connectionInstance;
};

module.exports = connectDB;
