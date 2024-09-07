const mysql = require("mysql2/promise");
const helper = require("../utils/helper");
const config = require("../db/config");
const {
  getTotalRecord,
  getRecord,
  insertRecord,
  getRecordById,
  updateRecordById,
} = require("../utils/sqlFunctions");

async function getCategory(req) {
  const {
    search = "",
    order,
    sort,
    page = 1,
    limit = config.listPerPage,
  } = req.query;

  const offset = helper.getOffSet(page, limit);
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

  return { data, pagination };
}

async function getCategoryById(id) {
  const rows = await getRecordById("product_category", id);
  const data = helper.emptyOrRows(rows);
  return { data };
}

async function createCategory(req) {
  const { categoryName, categorySlug } = req.body;
  const thumbnail = req?.file?.path;

  const category = {
    name: categoryName,
    slug: categorySlug,
    thumbnail,
  };
  const result = await insertRecord("product_category", category);

  let message = "Error in creating Category";
  if (result.affectedRows) {
    message = "Category created successfully";
  }

  return message;
}

async function updateCategoryById(id, req) {
  const { categoryName, categorySlug, categoryStatus } = req.body;
  const category = {
    name: categoryName,
    slug: categorySlug,
    is_status: categoryStatus,
    updated_at: helper.getTimes(),
  };

  console.log(req.file);

  const thumbnail = req?.file?.path;
  if (thumbnail) {
    Object.assign(category, { thumbnail });
  }

  const result = await updateRecordById("product_category", category, id);
  let message = "Error in updating Category";
  if (result.affectedRows) {
    message = "Category updated successfully";
  }
  return message;
}

module.exports = {
  getCategory,
  createCategory,
  getCategoryById,
  updateCategoryById,
};
