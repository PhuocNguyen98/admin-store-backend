const express = require("express");
const {
  getDiscount,
  getDiscountById,
  createDiscount,
  updateDiscountById,
} = require("../controllers/discountController");
const router = express.Router();

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("discount");

router.get("/", getDiscount);
router.get("/:id", getDiscountById);
router.post("/", upload.single("discountImage"), createDiscount);
router.post("/:id", upload.single("discountImage"), updateDiscountById);

module.exports = router;
