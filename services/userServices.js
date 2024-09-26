const TABLE_NAME = "staff";
const helper = require("../utils/helper");
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

module.exports = {
  getUserProfileByIdServices,
  updateUserProfileServices,
};
