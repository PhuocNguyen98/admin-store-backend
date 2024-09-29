const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProduct,
  createProduct,
  getProductById,
  updateProductById,
  quickUpdateProduct,
} = require("../controllers/productController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("product", true);
const cpUpload = upload.fields([
  { name: "productThumbnail", maxCount: 1 },
  { name: "productImages", maxCount: 20 },
]);

router.all("*", auth);
router.get("/", getProduct);
router.get("/:id", getProductById);
router.post("/", cpUpload, createProduct);
router.put("/:id", cpUpload, updateProductById);
router.put("/", quickUpdateProduct);

module.exports = router;
