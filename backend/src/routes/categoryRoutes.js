const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { categoryValidator } = require("../validators/categoryValidator");

const { authToken } = require("../middlewares/token");
const { restrictTo } = require("../middlewares/roleCheck");
const { validate } = require("../utils/utils");

router.post(
  "/",
  authToken,
  restrictTo("Admin"),
  categoryValidator,
  validate,
  createCategory
);

router.get("/", getCategories);

router.get("/:id", authToken, restrictTo("Admin"), getCategoryById);

router.put("/:id", authToken, restrictTo("Admin"), updateCategory);

router.delete("/:id", authToken, restrictTo("Admin"), deleteCategory);

module.exports = router;
