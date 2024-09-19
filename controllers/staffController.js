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
  checkRecordExists,
  getRecordV2,
} = require("../utils/sqlFunctions");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const getStaff = async (req, res) => {
  const params = req.query;
  if (Object.keys(params).length > 0) {
    const {
      search = "",
      order,
      sort,
      page = 1,
      limit = config.listPerPage,
    } = params;
    const offset = helper.getOffSet(page, limit);
    try {
      let queryString = {
        fields: `staff.username, staff.email, staff_role.name as role`,
        tableName: "staff",
        joinTable: `inner join staff_role on staff.role_id = staff_role.id `,
        order_by: order ? `staff.${order}` : "staff.id",
        sort,
        limit,
        offset,
        searchColumn: "staff.username",
        searchString: search,
      };

      const rows = await getRecordV2(queryString);

      const totalRows = await getTotalRecord("staff", "username", search);
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
        .json({ status: 500, message: `Error while getting supplier` });
    }
  } else {
    try {
      const rows = await getAllRecord("*", "staff");
      const data = helper.emptyOrRows(rows);
      res.status(200).json({ status: 200, data });
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: `Error while getting staff` });
    }
  }
};

const createStaff = async (req, res) => {
  let {
    staffUsername: username,
    staffPassword: password,
    staffRole: role_id,
  } = req.body;

  if (!username || !password || !role_id) {
    res.status(400).json({
      status: 400,
      message: "Username  or Password or Role fields cannot be empty!",
    });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newStaff = {
    staff_id: uuidv4(),
    username,
    password: hashedPassword,
    role_id,
  };
  try {
    const staffAlreadyExists = await checkRecordExists(
      "staff",
      "username",
      username
    );
    if (staffAlreadyExists) {
      res
        .status(409)
        .json({ status: 409, message: "Username staff already exists" });
    } else {
      const result = await insertRecord("staff", newStaff);
      if (result.affectedRows) {
        message = "Staff created successfully";
      }
      res.status(201).json({ status: 201, message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateStaffById = async (req, res) => {
  let { id } = req.params;
  let { staffRole: role_id } = req.body;
  let message = "Error in updating Staff";
  if (id) {
    try {
      const staffAlreadyExists = checkRecordExists("staff", "id", id);
      if (staffAlreadyExists) {
        const result = await updateRecordById("staff", { role_id }, id);
        if (result.affectedRows) {
          message = "Staff updated successfully";
        }
        res.status(200).json({ status: 200, message });
      } else {
        res.status(409).json({ status: 409, message: "Staff already exists" });
        return;
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  } else {
    res.status(400).json({
      status: 400,
      message: "Role fields cannot be empty!",
    });
    return;
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaffById,
};
