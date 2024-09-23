const express = require("express");
const { login, getAccount } = require("../controllers/authControllers");
const router = express.Router();
const auth = require("../middleware/auth");

router.all("*", auth);

router.post("/login", login);
router.get("/account", getAccount);

module.exports = router;
