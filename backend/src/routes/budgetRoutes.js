const express = require("express");
const router = express.Router();
const {
  createOrUpdateBudget,
  getBudgets,
  getBudgetSummary,
  recommendAdjustments,
} = require("../controllers/budgetController");
const { authToken } = require("../middlewares/token");
const { restrictTo } = require("../middlewares/roleCheck");
const { validate } = require("../utils/utils");

router.post("/", authToken, restrictTo("User"), createOrUpdateBudget);

router.get("/", authToken, restrictTo("User"), getBudgets);

router.get("/summary", authToken, restrictTo("User"), getBudgetSummary);

router.get(
  "/recommendation",
  authToken,
  restrictTo("User"),
  recommendAdjustments
);

module.exports = router;
