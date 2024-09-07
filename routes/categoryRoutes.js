const express = require("express");
const {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
} = require("../controllers/testController");
const router = express.Router();

const uploadCloud = require("../configs/cloudinary.config");
const upload = uploadCloud("category");

router.get("/", getCategory);
router.get("/:id", getCategoryById);
router.post("/", upload.single("categoryImage"), createCategory);
router.post("/:id", upload.single("categoryImage"), updateCategoryById);

module.exports = router;
