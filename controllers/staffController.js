const mysql = require("mysql2/promise");
const config = require("../db/config");
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
        fields: `staff.id,staff.username,staff.email,staff.role_id, staff.password,staff.is_status,staff.created_at, staff_role.name as role`,
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

const getStaffById = async (req, res) => {
  const { id } = req.params;
  if (id) {
    try {
      const result = await checkRecordExists("staff", "id", id);
      if (Object.keys(result).length > 0) {
        const rows = await getRecordById("staff", id);
        const data = helper.emptyOrRows(rows);
        res.status(200).json({ status: 200, data });
      } else {
        res
          .status(500)
          .json({ status: 500, message: `Error while getting staff` });
      }
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message });
    }
  } else {
    res.status(500).json({ status: 500, message: "Id fields empty" });
  }
};

const createStaffAccount = async (req, res) => {
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
      let data;
      if (result.affectedRows) {
        let queryString = {
          fields: `staff.username, staff.email,staff.role_id, staff.is_status`,
          tableName: "staff",
          order_by: "staff.id",
          conditions: `staff.id =${result.insertId} `,
        };
        data = await getRecordV2(queryString);
        message = "Staff created successfully";
      }
      res.status(201).json({ status: 201, data, message });
    }
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateStaffAccountById = async (req, res) => {
  let message = "Error in updating Staff";
  let isUpdate = 0;

  const formData = req.body.formList;
  if (formData.length > 0) {
    for (let i = 0; i < formData.length; i++) {
      if (formData[i]?.id) {
        try {
          const [staff] = await getRecordById("staff", formData[i].id);
          if (Object.keys(staff).length > 0) {
            let newStaff = {};

            if (staff.role_id !== formData[i]?.role_id) {
              newStaff = { role_id: formData[i]?.role_id };
            }

            if (staff.is_status !== formData[i]?.is_status) {
              newStaff = { ...newStaff, is_status: formData[i]?.is_status };
            }

            if (Object.keys(newStaff).length > 0) {
              const result = await updateRecordById(
                "staff",
                newStaff,
                formData[i].id
              );
              if (result.affectedRows) {
                isUpdate += 1;
              }
            }
          } else {
            res.status(409).json({ status: 409, message: "Staff not exists" });
            return;
          }
        } catch (error) {
          res.status(500).json({
            status: 500,
            message: "Error in updating Staff",
          });
        }
      }
    }

    if (isUpdate > 0) {
      message = "Staff updated successfully";
      res.status(200).json({ status: 200, message });
    } else {
      message = "No changes detected";
      res.status(200).json({ status: 200, message, flag: true });
    }
  } else {
    res.status(400).json({
      status: 400,
      message: "Error in updating Staff",
    });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaffAccount,
  updateStaffAccountById,
};
