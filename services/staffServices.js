const TABLE_NAME = "staff";
const config = require("../db/config");
const helper = require("../utils/helper");
const cloudinary = require("../cloudinary/config");
const {
  getAllRecordV2,
  getRecordV2,
  getRecordByIdV2,
  getTotalRecordV2,
  insertRecordV2,
  updateRecordByIdV2,
  checkRecordExistsV2,
} = require("../utils/sqlFunctions");

const getAllStaffServices = async () => {
  try {
    let fields = `staff.id, staff.username, staff.email, staff.is_status, staff_role.name as role`;

    let joinTable = `inner join staff_role on staff.role_id = staff_role.id `;

    const rows = await getAllRecordV2({
      fields,
      table: TABLE_NAME,
      joinTable,
    });
    const data = helper.emptyOrRows(rows);
    return {
      status: 200,
      data,
    };
  } catch (error) {
    return {
      message: "Error while getting staff",
    };
  }
};

const getStaffServices = async (query) => {
  let { search, order, sort, page, limit } = query;

  page = page ? page : 1;
  limit = limit ? limit : config.listPerPage;
  const offset = helper.getOffSet(page, limit);

  try {
    let fields = `staff.id, staff.username, staff.email, staff.is_status, staff_role.name as role`;
    let joinTable = `inner join staff_role on staff.role_id = staff_role.id`;

    const rows = await getRecordV2({
      fields: fields,
      table: TABLE_NAME,
      joinTable,
      sort: sort ? sort : "staff.id",
      order_by: order ? order : "asc",
      limit,
      offset,
      searchColumn: "staff.username",
      searchMultipleColumn: ["staff.email"],
      searchString: search,
    });
    const data = helper.emptyOrRows(rows);

    const totalRows = await getTotalRecordV2({
      table: TABLE_NAME,
      searchColumn: "username",
      searchMultipleColumn: ["email"],
      searchString: search,
    });
    const totalPage = Math.round(totalRows / limit, 0);
    const pagination = {
      rowsPerPage: +limit,
      totalRows,
      totalPage,
      pageCurrent: +page,
    };

    return {
      status: 200,
      data,
      pagination,
    };
  } catch (error) {
    return { message: "Error while getting staff" };
  }
};

const getStaffByIdServices = async (id) => {
  try {
    const staff = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });

    if (!staff) {
      return { status: 404, message: "Staff not exist!" };
    } else {
      const rows = await getRecordByIdV2({
        fields:
          "staff_id, first_name, last_name, avatar, gender, birthday, email, phone, address, education, information",
        table: TABLE_NAME,
        id,
      });
      const data = helper.emptyOrRows(rows);
      return {
        status: 200,
        data,
      };
    }
  } catch (error) {
    return { message: "Error while getting staff" };
  }
};

const createStaffAccountServices = async (newStaff) => {
  try {
    const usernameStaffExist = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "username",
      value: newStaff.username,
    });

    if (usernameStaffExist) {
      return {
        status: 409,
        message: "Username account already exists",
      };
    } else {
      if (newStaff.email !== "") {
        const emailStaffExist = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "email",
          value: newStaff.email,
        });
        if (emailStaffExist) {
          return {
            status: 409,
            message: "Email account already exists",
          };
        }
      }

      const result = await insertRecordV2({
        table: TABLE_NAME,
        record: newStaff,
      });

      if (result.affectedRows) {
        return {
          status: 201,
          message: "Staff account created successfully",
        };
      } else {
        return {
          status: 500,
          message: "Error while creating staff account",
        };
      }
    }
  } catch (error) {
    return {
      message: "Error while creating account staff",
    };
  }
};

const quickUpdateStaffAccountServices = async (data) => {
  try {
    let isFlag = false;
    for (let i = 0; i < data.length; i++) {
      let id = data[i]?.id;
      let is_status = data[i]?.is_status;
      if (!id || is_status === null || is_status === undefined) {
        return {
          status: 400,
          message: "Invalid information",
        };
      } else {
        const staff = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "id",
          value: id,
        });

        if (!staff) {
          return {
            status: 400,
            message: "Staff account not exist",
          };
        } else {
          let newStaff = {};
          if (staff.is_status !== is_status) newStaff = { is_status };

          if (!Object.keys(newStaff).length > 0) {
            continue;
          } else {
            const result = await updateRecordByIdV2({
              table: TABLE_NAME,
              record: newStaff,
              id,
            });
            if (result.affectedRows) {
              isFlag = true;
            } else {
              return {
                message: "Error in updating staff account",
              };
            }
          }
        }
      }
    }

    if (isFlag) {
      return {
        status: 200,
        message: "Staff account updated successfully",
      };
    } else {
      return {
        flag: true,
        status: 200,
        message: "No changes detected",
      };
    }
  } catch (error) {
    return {
      message: "Error while updating account staff",
    };
  }
};

module.exports = {
  getAllStaffServices,
  getStaffServices,
  getStaffByIdServices,
  createStaffAccountServices,
  quickUpdateStaffAccountServices,
};
