const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} = require("../controllers/userController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("user");

router.get("/profile", getUserProfile);
router.put("/profile", upload.single("userAvatar"), updateUserProfile);
router.put("/profile/change/password", changeUserPassword);

module.exports = router;
