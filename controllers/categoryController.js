const { getRecord, insertRecord } = require("../utils/sqlFunctions");
const helper = require("../utils/helper");

async function getCategory() {
  const rows = await getRecord("*", "product_category", "id", "DESC");
  const data = helper.emptyOrRows(rows);
  return { data };
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
