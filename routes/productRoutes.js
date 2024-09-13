const express = require("express");
const { getProduct } = require("../controllers/productController");
const router = express.Router();

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("supplier");

router.get("/", getProduct);

module.exports = router;
