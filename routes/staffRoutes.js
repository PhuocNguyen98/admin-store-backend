const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getStaff,
  getStaffById,
  createStaffAccount,
  quickUpdateStaffAccount,
} = require("../controllers/staffController");

router.all("*", auth);
router.get("/", getStaff);
router.get("/:id", getStaffById);
router.post("/account", createStaffAccount);
router.put("/account", quickUpdateStaffAccount);

module.exports = router;
