const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const helper = require("../utils/helper");
const {
  // getAllStaffServices,
  getStaffServices,
  getStaffByIdServices,
  createStaffAccountServices,
  quickUpdateStaffAccountServices,
} = require("../services/staffServices");

const getStaff = async (req, res) => {
  const query = req.query;
  const data = await getStaffServices(query);
  res.status(200).json({ data });
};

const getStaffById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await getStaffByIdServices(id);
    res.status(200).json({ data });
  }
};

const createStaffAccount = async (req, res) => {
  let {
    staffUsername: username,
    staffEmail: email,
    staffPassword: password,
  } = req.body;

  if (!username || !password) {
    res
      .status(400)
      .json({ message: "Usernam, Password fields cannot be empty!" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newStaff = {
      staff_id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      role_id: 2, // { 1: Admin, 2: Nhân viên} => mặc định sẽ là 2
      is_status: 0, // { 0: Vô hiệu hóa, 1: Kích hoạt} => mặc định là 0
      created_at: helper.getTimes(),
    };

    const data = await createStaffAccountServices(newStaff);
    res.status(200).json({ data });
  }
};

const quickUpdateStaffAccount = async (req, res) => {
  const formList = req.body?.formList;
  if (!formList.length > 0) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await quickUpdateStaffAccountServices(formList);
    res.status(200).json({ data });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaffAccount,
  quickUpdateStaffAccount,
};
