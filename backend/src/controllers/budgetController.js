const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const handleResponse = require("../utils/response");
const { BadRequestError } = require("../utils/ErrorHandling/CustomErrors");

// Create or update a budget
exports.createOrUpdateBudget = async (req, res, next) => {
  const userId = req.user._id;
  const { category, month, year, budgetAmount } = req.body;

  try {
    let existingBudget = await Budget.findOne({
      userId,
      month,
      year,
      category,
    });

    if (existingBudget) {
      // Update the existing budget
      existingBudget.budgetAmount = budgetAmount;
      existingBudget.spentAmount = 0; // Reset spent amount if budget is updated
      existingBudget.isExceeded = false; // Reset exceeded flag

      await existingBudget.save();
      return handleResponse(
        res,
        200,
        "Budget updated successfully",
        existingBudget
      );
    }

    // Create a new budget
    const newBudget = new Budget({
      userId,
      category,
      month,
      year,
      budgetAmount,
    });

    await newBudget.save();
    return handleResponse(res, 201, "Budget created successfully", newBudget);
  } catch (error) {
    console.error(error);
    return next(new BadRequestError("Error creating or updating budget"));
  }
};

// Fetch all budgets for a user
exports.getBudgets = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const budgets = await Budget.find({ userId });
    return handleResponse(res, 200, "Budgets fetched successfully", budgets);
  } catch (error) {
    console.error(error);
    return next(new BadRequestError("Error fetching budgets"));
  }
};

// Fetch budget summary for the current month or a specific category
exports.getBudgetSummary = async (req, res, next) => {
  const userId = req.user._id;
  const { month, year, category } = req.query;

  try {
    let filter = { userId, month, year };

    if (category) filter.category = category;

    const budget = await Budget.findOne(filter);

    if (!budget) {
      return next(
        new BadRequestError("No budget found for the provided filter")
      );
    }

    // Fetch total spent amount for the specified category and month
    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: category || { $exists: true },
          date: {
            $gte: new Date(`${year}-${month}-01`),
            $lt: new Date(`${year}-${month + 1}-01`),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    budget.spentAmount = totalSpent[0] ? totalSpent[0].total : 0;
    budget.isExceeded = budget.spentAmount > budget.budgetAmount;

    await budget.save();

    return handleResponse(res, 200, "Budget summary fetched successfully", {
      budget,
      totalSpent: budget.spentAmount,
      isExceeded: budget.isExceeded,
    });
  } catch (error) {
    console.error(error);
    return next(new BadRequestError("Error fetching budget summary"));
  }
};

exports.recommendAdjustments = async (req, res, next) => {
  const userId = req.user._id;
  const { month, year, category } = req.query;

  // Mapping month name to numeric value
  const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // Convert the month name to a numeric value
  const monthNumber = months[month];

  // If month is invalid, return an error
  if (!monthNumber) {
    console.log("Error: Invalid month provided");
    return next(new BadRequestError("Invalid month provided"));
  }

  console.log("User ID from token:", userId);
  console.log("Month Number:", monthNumber);

  try {
    // Find the budget for the given user, month, year, and category
    let filter = { userId, month, year };

    if (category) filter.category = category;

    console.log("Looking for budget with filter:", filter); // Debug log

    const budget = await Budget.findOne(filter);

    if (!budget) {
      console.log("Error: No budget found for the provided filter");
      return next(
        new BadRequestError("No budget found for the provided filter")
      );
    }

    // Filter transactions based on month, year, and category
    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: category || { $exists: true },
          // Compare the year and month directly
          $expr: {
            $and: [
              { $eq: [{ $year: "$date" }, parseInt(year)] }, // Match year
              { $eq: [{ $month: "$date" }, monthNumber] }, // Match month
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }, // Sum the amount
    ]);

    console.log("Total spent:", totalSpent); // Debug log

    const spentAmount = totalSpent[0] ? totalSpent[0].total : 0;

    // Compare total spent with the budget amount
    if (spentAmount > budget.budgetAmount) {
      console.log("Exceeding budget, current spending:", spentAmount);
      return handleResponse(
        res,
        200,
        "Recommendation: You have exceeded your budget. Consider reducing your spending in the next period.",
        {
          adjustmentNeeded: true,
          suggestedNewBudget: spentAmount,
        }
      );
    }

    if (spentAmount > budget.budgetAmount * 0.8) {
      console.log("Nearing budget, current spending:", spentAmount);
      return handleResponse(
        res,
        200,
        "Recommendation: You are nearing your budget limit. Consider reducing your spending.",
        {
          adjustmentNeeded: true,
          suggestedNewBudget: spentAmount,
        }
      );
    }

    console.log("Spending within budget, current spending:", spentAmount);
    return handleResponse(
      res,
      200,
      "Your spending is within the budget for the selected period.",
      {
        adjustmentNeeded: false,
      }
    );
  } catch (error) {
    console.error("Error in recommendAdjustments:", error);
    return next(new BadRequestError("Error generating budget recommendations"));
  }
};
