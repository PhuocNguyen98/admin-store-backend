const TABLE_NAME = "staff";
const helper = require("../utils/helper");
const bcrypt = require("bcryptjs");
const cloudinary = require("../cloudinary/config");
const {
  getRecordV2,
  updateRecordByIdV2,
  checkRecordExistsV2,
} = require("../utils/sqlFunctions");

const getUserProfileByIdServices = async (staffId) => {
  try {
    const staff = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "staff_id",
      value: staffId,
    });
    if (!staff) {
      return { status: 404, message: "Profile not exist!" };
    } else {
      const rows = await getRecordV2({
        fields:
          "first_name, last_name, avatar, gender, birthday, email, phone, address, education, information",
        table: TABLE_NAME,
        conditions: `staff_id = '${staffId}'`,
      });
      const data = helper.emptyOrRows(rows);
      return {
        status: 200,
        data,
      };
    }
  } catch (error) {
    return { message: "Error while getting profile" };
  }
};

const updateUserProfileServices = async (id, dataUser) => {
  try {
    const user = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "staff_id",
      value: id,
    });

    if (!user) {
      return { status: 404, message: "Profile not exist!" };
    } else {
      if (user?.cloudinary_id) {
        if (dataUser.avatar === "") {
          await cloudinary.uploader.destroy(user?.cloudinary_id);
          dataUser = { ...dataUser, cloudinary_id: "" };
        } else {
          if (dataUser.avatar !== user?.avatar) {
            await cloudinary.uploader.destroy(user?.cloudinary_id);
          }
        }
      }

      const result = await updateRecordByIdV2({
        table: TABLE_NAME,
        record: dataUser,
        id: user.id,
      });

      if (result.affectedRows) {
        return {
          status: 200,
          message: "Profile updated successfully",
        };
      } else {
        return {
          status: 500,
          message: "Error in updating profile",
        };
      }
    }
  } catch (error) {
    return { message: "Error while updating profile" };
  }
};

const changeUserPasswordServices = async (staffId, dataPassword) => {
  try {
    const staff = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "staff_id",
      value: staffId,
    });

    if (!staff) {
      return { status: 404, message: "User not exist!" };
    } else {
      const passwordMatch = await bcrypt.compare(
        dataPassword.passwordOld,
        staff.password
      );
      if (!passwordMatch) {
        return {
          status: 401,
          message: "Password old incorrect, please check again.",
        };
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
          dataPassword.passwordNew,
          salt
        );
        const newPassword = {
          password: hashedPassword,
          updated_at: helper.getTimes(),
        };

        const result = await updateRecordByIdV2({
          table: TABLE_NAME,
          record: newPassword,
          id: staff.id,
        });

        if (result.affectedRows) {
          return {
            status: 200,
            message: "Changed password successfully",
          };
        } else {
          return {
            status: 500,
            message: "Error in changing password",
          };
        }
      }
    }
  } catch (error) {
    return { message: "Error while changing password" };
  }
};

module.exports = {
  getUserProfileByIdServices,
  updateUserProfileServices,
  changeUserPasswordServices,
};
