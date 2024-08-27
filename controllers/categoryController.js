const config = require("../db/config");
const helper = require("../utils/helper");
const {
  getTotalRecord,
  getRecord,
  insertRecord,
} = require("../utils/sqlFunctions");

async function getCategory(req) {
  const { order, sort, page = 1, limit = config.listPerPage } = req.query;

  const totalRows = await getTotalRecord("product_category");
  const totalPage = Math.round(totalRows / limit, 0);
  const offset = helper.getOffSet(page, limit);

  const rows = await getRecord(
    "*",
    "product_category",
    order,
    sort,
    limit,
    offset
  );

  const data = helper.emptyOrRows(rows);
  const pagination = {
    pageSize: +limit,
    totalPage,
    totalRows,
  };

  return { data, pagination };
}

async function createCategory(req) {
  const { categoryName, categorySlug } = req.body;
  const thumbnail = req?.file?.filename;

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

module.exports = {
  getCategory,
  createCategory,
};
