const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  getSummary,
  deleteTransaction,
} = require("../controllers/transactionController");
const { transactionValidator } = require("../validators/transactionValidator");
const { authToken } = require("../middlewares/token");
const { restrictTo } = require("../middlewares/roleCheck");
const { validate } = require("../utils/utils");

router.post(
  "/",
  authToken,
  restrictTo("User"),
  transactionValidator,
  validate,
  createTransaction
);

router.get("/", authToken, restrictTo("User"), getTransactions);

router.put(
  "/:transactionId", // The transactionId is a parameter
  authToken,
  restrictTo("User"),
  updateTransaction // The controller method for updating the transaction
);

router.get("/summary", authToken, restrictTo("User"), getSummary);

router.delete(
  "/:transactionId",
  authToken,
  restrictTo("User"),
  deleteTransaction
);

module.exports = router;
