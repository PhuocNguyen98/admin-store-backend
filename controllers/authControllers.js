const jwt = require("jsonwebtoken");
const {
  loginServices,
  getAccountServicesById,
  refreshTokenServices,
  logoutServices,
} = require("../services/authServices");

const login = async (req, res) => {
  const { username, password } = req.body;
  let isUsername = username ?? false;

  if (isUsername) {
    if (!password) {
      res.status(400).json({ message: "Password fields cannot be empty!" });
      return;
    } else {
      const data = await loginServices(username, password);
      res.status(200).json({ data });
    }
  } else {
    res.status(400).json({ message: "Username fields cannot be empty!" });
    return;
  }
};

const getAccount = async (req, res) => {
  if (req.staff && req.staff.staffId) {
    const data = await getAccountServicesById(req.staff.staffId);
    res.status(200).json({ data });
  } else {
    res.status(400).json({ message: "Cannot get account info" });
    return;
  }
};

const refreshToken = async (req, res) => {
  const token = req.body?.token;
  if (!token) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_REFRESH);
    const data = await refreshTokenServices(decoded.staff_id, token);
    res.status(200).json({ data });
  }
};

const logout = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const data = await logoutServices(decoded.staff_id);
      res.status(200).json({ data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  login,
  getAccount,
  refreshToken,
  logout,
};
