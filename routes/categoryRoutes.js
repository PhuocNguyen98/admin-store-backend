const express = require("express");
const {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
} = require("../controllers/categoryController");
const router = express.Router();

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("category");

router.get("/", getCategory);
router.get("/:id", getCategoryById);
router.post("/", upload.single("categoryImage"), createCategory);
router.post("/:id", upload.single("categoryImage"), updateCategoryById);

module.exports = router;
