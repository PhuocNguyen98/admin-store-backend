const express = require("express");
const router = express.Router();
const {
  getStaff,
  createStaff,
  updateStaffById,
} = require("../controllers/staffController");

const { getStaffRole } = require("../controllers/staffRoleController");

// const uploadCloud = require("../cloudinary/cloudinary");
// const upload = uploadCloud("supplier");

router.get("/", getStaff);
router.post("/", createStaff);
router.put("/:id", updateStaffById);

//Role
router.get("/role", getStaffRole);

module.exports = router;
