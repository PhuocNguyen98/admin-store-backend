const express = require("express");
const { createCategory } = require("../controllers/categoryController");
const router = express.Router();
const path = require("path");
let locationPath = path.join(__dirname, "../", "public", "uploads", "category");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, locationPath);
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  upload.single("categoryImage"),
  async function (req, res, next) {
    try {
      if (req.file) {
        res.json(await createCategory(req));
      } else {
        res.status(400).json({ error: "File not found !" });
      }
    } catch (error) {
      console.error(`Error while getting category`, err.message);
      next(err);
    }
  }
);

module.exports = router;
