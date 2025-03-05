const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      required: false,
      type: String,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
      expires: 365 * 86400,
    },
  },
  {
    timestamps: true,
  }
);

const RefreshToken = new mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
