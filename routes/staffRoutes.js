const express = require("express");
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaffAccount,
  updateStaffAccountById,
} = require("../controllers/staffController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("staff");

router.get("/", getStaff);
router.get("/:id", getStaffById);
router.post("/account", createStaffAccount);
router.put("/account", updateStaffAccountById);

module.exports = router;
