const dayjs = require("dayjs");
const helper = require("../utils/helper");
const {
  getUserProfileByIdServices,
  updateUserProfileServices,
  changeUserPasswordServices,
} = require("../services/userServices");

const getUserProfile = async (req, res) => {
  const staffId = req?.staff?.staffId;
  if (!staffId) {
    res.status(400).json({ message: "Invalid information" });
  } else {
    const data = await getUserProfileByIdServices(staffId);
    res.status(200).json({ data });
  }
};

const updateUserProfile = async (req, res) => {
  const staffId = req?.staff?.staffId;
  if (!staffId) {
    res.status(400).json({ message: "Invalid information" });
  } else {
    let {
      userFirstName: first_name,
      userLastName: last_name,
      userGender: gender,
      userEmail: email,
      userPhone: phone,
      userAddress: address,
      userEducation: education,
      userInformation: information,
      userBirthday: birthday,
      userAvatar: avatar,
    } = req.body;

    let dataUser = {
      first_name,
      last_name,
      gender: gender ? gender : 0,
      email,
      phone,
      address,
      education,
      information,
      avatar: avatar ? avatar : "",
      birthday: birthday ? dayjs(birthday).format("DD-MM-YYYY") : "",
      updated_at: helper.getTimes(),
    };

    if (req.file && Object.keys(req.file).length > 0) {
      dataUser = {
        ...dataUser,
        avatar: req.file?.path,
        cloudinary_id: req.file?.filename,
      };
    }

    const data = await updateUserProfileServices(staffId, dataUser);
    res.status(200).json({ data });
  }
};

const changeUserPassword = async (req, res) => {
  const staffId = req?.staff?.staffId;
  if (!staffId) {
    res.status(400).json({ message: "Invalid information" });
  } else {
    const { userPasswordOld: passwordOld, userPasswordNew: passwordNew } =
      req.body;

    const dataPassword = { passwordOld, passwordNew };
    const data = await changeUserPasswordServices(staffId, dataPassword);
    res.status(200).json({ data });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
};
