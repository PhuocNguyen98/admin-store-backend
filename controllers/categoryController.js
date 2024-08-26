const { insertRecord } = require("../utils/sqlFunctions");
const helper = require("../utils/helper");

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
  createCategory,
};
