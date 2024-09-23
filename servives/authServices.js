const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { checkRecordExists } = require("../utils/sqlFunctions");

const loginServices = async (username, password) => {
  try {
    //Check staff exist
    const staff = await checkRecordExists("staff", "username", username);
    if (staff) {
      if (!staff.password) {
        return {
          status: 400,
          message: "Username or password incorrect, please check again.",
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

        return {
          status: 200,
          access_token,
        };
      } else {
        return {
          status: 401,
          message: "Username or password incorrect, please check again.",
        };
      }
    } else {
      return {
        status: 401,
        message: "Username or password incorrect, please check again.",
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
        account: {
          username: staff.username,
        },
      };
    } else {
      return {
        status: 401,
        message: "Cannot get account info",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: error,
    };
  }
};

module.exports = {
  loginServices,
  getAccountServicesById,
};
