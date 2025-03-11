const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
    budgetAmount: {
      type: Number,
      required: true,
    },
    spentAmount: {
      type: Number,
      default: 0,
    },
    isExceeded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model("Budget", budgetSchema);

module.exports = Budget;
