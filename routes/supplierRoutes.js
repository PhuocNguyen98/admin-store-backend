const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplierById,
  quickUpdateSupplier,
} = require("../controllers/supplierController");

const uploadCloud = require("../cloudinary/cloudinary");
const upload = uploadCloud("supplier");

router.all("*", auth);
router.get("/", getSupplier);
router.get("/:id", getSupplierById);
router.post("/", upload.single("supplierImage"), createSupplier);
router.put("/:id", upload.single("supplierImage"), updateSupplierById);
router.put("/", quickUpdateSupplier);

module.exports = router;
