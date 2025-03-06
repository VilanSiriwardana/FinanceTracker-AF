const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");
const handleResponse = require("../utils/response");

exports.createTransaction = async (req, res, next) => {
  const { amount, type, category, description } = req.body;
  const userId = req.user._id;
  console.log("User ID from token:", userId);

  try {
    if (!amount || !type || !category) {
      return res
        .status(400)
        .json({ msg: "Amount, type, and category are required" });
    }

    const transaction = new Transaction({
      userId,
      amount,
      type,
      category,
      description,
    });

    await transaction.save();

    return handleResponse(
      res,
      201,
      "Transaction created successfully",
      transaction
    );
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  const userId = req.user._id;
  const { type, category, startDate, endDate } = req.query;

  try {
    let filters = { userId };

    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters).sort({ date: -1 });

    return handleResponse(
      res,
      200,
      "Transactions fetched successfully",
      transactions
    );
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  const { transactionId } = req.params; 
  const { amount, type, category, description } = req.body; 

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to update this transaction" });
    }

    transaction.amount = amount || transaction.amount; 
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.description = description || transaction.description;

    await transaction.save();

    return handleResponse(
      res,
      200,
      "Transaction updated successfully",
      transaction
    );
  } catch (error) {
    console.error(error);
    return next(error); 
  }
};

exports.getSummary = async (req, res, next) => {
  const userId = req.user._id;

  console.log("User ID from token:", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new Error("Invalid User ID"));
  }

  try {
    const totalIncome = await Transaction.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId), type: "income" },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpense = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return handleResponse(res, 200, "Transaction summary", {
      totalIncome: totalIncome[0] ? totalIncome[0].total : 0,
      totalExpense: totalExpense[0] ? totalExpense[0].total : 0,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findByIdAndDelete(transactionId);

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    return handleResponse(
      res,
      200,
      "Transaction deleted successfully",
      transaction
    );
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
