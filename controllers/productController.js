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

const getProduct = async (req, res) => {
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
      "product",
      order,
      sort,
      limit,
      offset,
      (searchField = "name"),
      (searchString = search)
    );

    const totalRows = await getTotalRecord("product", "name", search);
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
      .json({ status: 500, message: `Error while getting product` });
  }
};

module.exports = {
  getProduct,
};
