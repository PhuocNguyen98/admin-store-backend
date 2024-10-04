const TABLE_NAME = "staff";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  checkRecordExists,
  checkRecordExistsV2,
  updateRecordByIdV2,
} = require("../utils/sqlFunctions");

const loginServices = async (username, password) => {
  try {
    //Check staff exist
    const staff = await checkRecordExists("staff", "username", username);
    if (staff) {
      if (!staff.password) {
        return {
          status: 400,
          message: "You don't have an account yet",
        };
      }

      if (staff.is_status === 0) {
        return {
          status: 400,
          message: "Your account has been disabled",
        };
      }

      // Compare password if staff exist and has password
      const passwordMatch = await bcrypt.compare(password, staff.password);
      if (passwordMatch) {
        const payload = {
          staff_id: staff.staff_id,
        };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        const refresh_token = jwt.sign(
          payload,
          process.env.JWT_SECRET_REFRESH,
          {
            expiresIn: process.env.JWT_EXPIRE_REFRESH,
          }
        );

        const result = await updateRecordByIdV2({
          table: TABLE_NAME,
          record: { refresh_token },
          id: staff.id,
        });

        if (result.affectedRows) {
          return {
            status: 200,
            data: {
              access_token,
              refresh_token,
            },
          };
        } else {
          return {
            status: 500,
            message: "Error system",
          };
        }
      } else {
        return {
          status: 400,
          message: "Username or password incorrect, please check again.",
        };
      }
    } else {
      return {
        status: 400,
        message: "You don't have an account yet",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: error,
    };
  }
};

const getAccountServicesById = async (id) => {
  try {
    const staff = await checkRecordExists("staff", "staff_id", id);
    if (staff) {
      return {
        status: 200,
        data: {
          username: staff.username,
          avatar: staff.avatar,
        },
      };
    } else {
      return {
        status: 401,
        message: "Cannot get user info",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: error,
    };
  }
};

const refreshTokenServices = async (id, token) => {
  try {
    const staff = await checkRecordExistsV2({
      table: "staff",
      column: "staff_id",
      value: id,
    });
    if (!staff) {
      return {
        status: 400,
        message: `Invalid information!`,
      };
    } else {
      if (staff.refresh_token === token) {
        const payload = {
          staff_id: staff.staff_id,
        };

        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });

        const refresh_token = jwt.sign(
          payload,
          process.env.JWT_SECRET_REFRESH,
          {
            expiresIn: JWT_EXPIRE_REFRESH,
          }
        );

        const result = await updateRecordByIdV2({
          table: TABLE_NAME,
          record: { refresh_token },
          id: staff.id,
        });

        if (result.affectedRows) {
          return {
            status: 200,
            data: {
              access_token,
              refresh_token,
            },
          };
        } else {
          return {
            status: 500,
            message: "Error system",
          };
        }
      } else {
        return {
          status: 400,
          message: `Invalid information!`,
        };
      }
    }
  } catch (error) {
    return {
      message: error,
    };
  }
};

const logoutServices = async (staffId) => {
  try {
    const staff = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "staff_id",
      value: staffId,
    });

    if (!staff) {
      return {
        status: 400,
        message: "Invalid information",
      };
    } else {
      const result = await updateRecordByIdV2({
        table: TABLE_NAME,
        record: { refresh_token: "" },
        id: staff.id,
      });

      if (result.affectedRows) {
        return {
          status: 200,
        };
      } else {
        return {
          status: 500,
        };
      }
    }
  } catch (error) {
    return {
      message: error,
    };
  }
};

module.exports = {
  loginServices,
  getAccountServicesById,
  refreshTokenServices,
  logoutServices,
};
