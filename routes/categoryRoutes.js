const express = require("express");
const {
  getCategory,
  createCategory,
} = require("../controllers/categoryController");
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

router.get("/", async function (req, res, next) {
  try {
    res.json(await getCategory());
  } catch (error) {
    console.error(`Error while getting category`, err.message);
    next(err);
  }
});

router.post(
  "/",
  upload.single("categoryImage"),
  async function (req, res, next) {
    try {
      res.json(await createCategory(req));
    } catch (error) {
      console.error(`Error while getting category`, err.message);
      next(err);
    }
  }
);

module.exports = router;
