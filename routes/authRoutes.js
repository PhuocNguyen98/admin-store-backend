const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  login,
  getAccount,
  refreshToken,
  logout,
} = require("../controllers/authControllers");

router.all("*", auth);

router.post("/login", login);
router.get("/account", getAccount);
router.get("/account/logout", logout);
router.post("/account/token", refreshToken);

module.exports = router;
