const mysql = require("mysql2/promise");
const helper = require("../utils/helper");
const config = require("../db/config");
const cloudinary = require("../cloudinary/config");
const {
  getTotalRecord,
  getRecord,
  getRecordById,
  insertRecord,
  updateRecordById,
} = require("../utils/sqlFunctions");

const getCategory = async (req, res) => {
  const {
    search = "",
    order,
    sort,
    page = 1,
    limit = config.listPerPage,
  } = req.query;
  const offset = helper.getOffSet(page, limit);

  try {
    const rows = await getRecord(
      "*",
      "product_category",
      order,
      sort,
      limit,
      offset,
      (searchField = "name"),
      (searchString = search)
    );

    const totalRows = await getTotalRecord("product_category", "name", search);
    const totalPage = Math.round(totalRows / limit, 0);

    const data = helper.emptyOrRows(rows);
    const pagination = {
      rowsPerPage: +limit,
      totalPage,
      totalRows,
    };

    res.status(200).json({ status: 200, data, pagination });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: `Error while getting category` });
  }
};

const getCategoryById = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const rows = await getRecordById("product_category", id);
    const data = helper.emptyOrRows(rows);

    res.status(200).json({ status: 200, data });
  } else {
    res
      .status(500)
      .json({ status: 500, message: `Error while getting category` });
  }
};

const createCategory = async (req, res) => {
  const { categoryName: name, categorySlug: slug } = req.body;
  let newCategory = {
    name,
    slug,
    created_at: helper.getTimes(),
  };
  let message = "Error in creating Category";

  try {
    if (req.file) {
      newCategory = {
        ...newCategory,
        thumbnail: req.file.path,
        cloudinary_id: req.file.filename,
      };
    }

    const result = await insertRecord("product_category", newCategory);
    if (result.affectedRows) {
      message = "Category created successfully";
    }
    res.status(200).json({ status: 200, message });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateCategoryById = async (req, res) => {
  const id = req.params.id;
  let message = "Error in updating Category";

  if (id) {
    const {
      categoryName: name,
      categorySlug: slug,
      categoryStatus: is_status,
    } = req.body;
    let newCategory = {
      name,
      slug,
      is_status,
      updated_at: helper.getTimes(),
    };

    try {
      if (req.file) {
        const rows = await getRecordById("product_category", id);
        const category = helper.emptyOrRows(rows);

        if (category[0].thumbnail && category[0].cloudinary_id) {
          await cloudinary.uploader.destroy(category[0].cloudinary_id);
        }

        newCategory = {
          ...newCategory,
          thumbnail: req.file.path,
          cloudinary_id: req.file.filename,
        };
      }

      const result = await updateRecordById(
        "product_category",
        newCategory,
        id
      );
      if (result.affectedRows) {
        message = "Category updated successfully";
      }
      res.status(200).json({ status: 200, message });
    } catch (error) {
      res.status(500).json({ status: 500, message });
    }
  } else {
    message = "Can not found category";
    res.status(500).json({ status: 500, message });
  }
};

module.exports = {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
};
