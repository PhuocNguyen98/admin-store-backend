const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getDiscount,
  getDiscountById,
  createDiscount,
  updateDiscountById,
  quickUpdateDiscount,
} = require("../controllers/discountController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("discount");

router.all("*", auth);
router.get("/", getDiscount);
router.get("/:id", getDiscountById);
router.post("/", upload.single("discountImage"), createDiscount);
router.put("/:id", upload.single("discountImage"), updateDiscountById);
router.put("/", quickUpdateDiscount);

module.exports = router;
