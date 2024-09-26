const express = require("express");
const router = express.Router();
const {
  getStaff,
  getStaffById,
  createStaffAccount,
  quickUpdateStaffAccount,
} = require("../controllers/staffController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("staff");

router.get("/", getStaff);
router.get("/:id", getStaffById);
router.post("/account", createStaffAccount);
router.put("/account", quickUpdateStaffAccount);

module.exports = router;
