const mysql = require("mysql2/promise");
const helper = require("../utils/helper");
const config = require("../db/config");
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

    res.status(200).json({ data, pagination });
  } catch (error) {
    res.status(500).json({ message: `Error while getting category` });
  }
};

const getCategoryById = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const rows = await getRecordById("product_category", id);
    const data = helper.emptyOrRows(rows);

    res.status(200).json({ data });
  } else {
    res.status(500).json({ message: `Error while getting category` });
  }
};

const createCategory = async (req, res) => {
  const { categoryName, categorySlug } = req.body;
  const thumbnail = req?.file?.path;

  const category = {
    name: categoryName,
    slug: categorySlug,
    thumbnail,
  };
  let message = "Error in creating Category";
  try {
    const result = await insertRecord("product_category", category);
    if (result.affectedRows) {
      message = "Category created successfully";
    }
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCategoryById = async (req, res) => {
  const id = req.params.id;
  const { categoryName, categorySlug, categoryStatus } = req.body;
  const category = {
    name: categoryName,
    slug: categorySlug,
    is_status: categoryStatus,
    updated_at: helper.getTimes(),
  };

  const thumbnail = req?.file?.path;
  if (thumbnail) {
    Object.assign(category, { thumbnail });
  }

  if (id) {
    let message = "Error in updating Category";
    try {
      const result = await updateRecordById("product_category", category, id);
      if (result.affectedRows) {
        message = "Category updated successfully";
      }

      res.status(200).json({ message });
    } catch (error) {
      res.status(500).json({ message });
    }
  } else {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
};
