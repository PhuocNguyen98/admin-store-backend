const mysql = require("mysql2/promise");
const config = require("../db/config");
const pool = mysql.createPool(config.db);
const helper = require("../utils/helper");
const cloudinary = require("../cloudinary/config");
const {
  getTotalRecord,
  getRecord,
  getRecordById,
  insertRecord,
  updateRecordById,
  getAllRecord,
  getRecordV2,
} = require("../utils/sqlFunctions");
const { query } = require("express");

const getStaffRole = async (req, res) => {
  try {
    const rows = await getAllRecord(
      "id as value, name as title",
      " staff_role"
    );
    const data = helper.emptyOrRows(rows);

    res.status(200).json({ status: 200, data });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error while getting staff role" });
  }
};

module.exports = {
  getStaffRole,
};
