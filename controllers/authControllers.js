const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  checkRecordExists,
  insertRecord,
  getRole,
} = require("../utils/sqlFunctions");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res
      .status(400)
      .json({ error: "Username or Email or Password fields cannot be empty!" });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const staff = {
    staff_id: uuidv4(),
    username,
    email,
    password: hashedPassword,
  };
  try {
    const userAlreadyExists = await checkRecordExists("staff", "email", email);
    if (userAlreadyExists) {
      res.status(409).json({ error: "Email already exists" });
    } else {
      await insertRecord("staff", staff);
      res.status(201).json({ message: "Staff created successfully!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, email, password } = req.body;
  let isEmail = email ?? false;
  let fieldCheck = isEmail ? email : username;
  if (isEmail) {
    if (!email || !password) {
      res
        .status(400)
        .json({ error: "Email or Password fields cannot be empty!" });
      return;
    }
  } else {
    if (!username || !password) {
      res
        .status(400)
        .json({ error: "Username or Password fields cannot be empty!" });
      return;
    }
  }

  try {
    const existingUser = await checkRecordExists(
      "staff",
      isEmail ? "email" : "username",
      fieldCheck
    );

    if (existingUser) {
      if (!existingUser.password) {
        res.status(401).json({ error: "Thông tin không hợp lệ" });
        return;
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (passwordMatch) {
        let staff_role = await getRole(existingUser.role_id);
        res.status(200).json({
          id: existingUser.staff_id,
          username: existingUser.username,
          role: staff_role,
          token: generateAccessToken(existingUser.staff_id),
        });
      } else {
        res.status(401).json({
          error: "Vui lòng kiểm tra lại mật khẩu",
          fieldError: "password",
        });
      }
    } else {
      res.status(401).json({
        error: "Vui lòng kiểm tra lại username hoặc email",
        fieldError: "username",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
