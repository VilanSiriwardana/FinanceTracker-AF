const Category = require("../models/Category");
const handleResponse = require("../utils/response");

exports.createCategory = async (req, res, next) => {
  const { name, type, description } = req.body;

  try {
    if (!name || !type) {
      return res
        .status(400)
        .json({ msg: "Category name and type are required" });
    }

    let category = await Category.findOne({ name });
    if (category)
      return res.status(400).json({ msg: "Category already exists" });

    category = new Category({ name, type, description });

    await category.save();

    return handleResponse(res, 201, "Category created successfully", category);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    return handleResponse(
      res,
      200,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    return handleResponse(res, 200, "Category fetched successfully", category);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, type, description } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name, type, description },
      { new: true }
    );

    if (!category) return res.status(404).json({ msg: "Category not found" });

    return handleResponse(res, 200, "Category updated successfully", category);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ msg: "Category not found" });

    return handleResponse(res, 200, "Category deleted successfully", category);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
