const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getCategory,
  createCategory,
  getCategoryById,
} = require("../controllers/categoryController");

let locationPath = path.join(__dirname, "../", "public", "uploads", "category");
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
    res.json(await getCategory(req));
  } catch (error) {
    console.error(`Error while getting category`, err.message);
    next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    res.json(await getCategoryById(req.params.id));
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
