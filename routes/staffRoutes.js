const express = require("express");
const {
  getStaff,
  createStaff,
  updateStaffById,
} = require("../controllers/staffController");
const router = express.Router();

// const uploadCloud = require("../cloudinary/cloudinary");
// const upload = uploadCloud("supplier");

router.get("/", getStaff);
router.post("/", createStaff);
router.put("/:id", updateStaffById);

module.exports = router;
