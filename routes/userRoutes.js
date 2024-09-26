const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("user");

router.get("/profile", getUserProfile);
router.put("/profile", upload.single("userAvatar"), updateUserProfile);

module.exports = router;
