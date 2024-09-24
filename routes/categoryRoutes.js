const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");
const {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
  quickUpdateCategory,
} = require("../controllers/categoryController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("category");

router.all("*", auth);

router.get("/", getCategory);
router.get("/:id", getCategoryById);
router.post("/", upload.single("categoryImage"), createCategory);
router.put("/:id", upload.single("categoryImage"), updateCategoryById);
router.put("/", quickUpdateCategory);

module.exports = router;
