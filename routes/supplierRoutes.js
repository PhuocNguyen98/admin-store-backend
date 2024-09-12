const express = require("express");
const {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplierById,
} = require("../controllers/supplierController");
const router = express.Router();

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("supplier");

router.get("/", getSupplier);
router.get("/:id", getSupplierById);
router.post("/", upload.single("supplierImage"), createSupplier);
router.put("/:id", upload.single("supplierImage"), updateSupplierById);

module.exports = router;
