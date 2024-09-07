const express = require("express");
const router = express.Router();
const {
  getCategory,
  createCategory,
  getCategoryById,
  updateCategoryById,
} = require("../controllers/categoryController");

const uploadCloud = require("../configs/cloudinary.config");
const upload = uploadCloud("category");

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

router.post(
  "/:id",
  upload.single("categoryImage"),
  async function (req, res, next) {
    try {
      res.json(await updateCategoryById(req.params.id, req));
    } catch (error) {
      console.error(`Error while getting category`, err.message);
      next(err);
    }
  }
);

module.exports = router;
