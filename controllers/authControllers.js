const jwt = require("jsonwebtoken");
const {
  loginServices,
  getAccountServicesById,
  refreshTokenServices,
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
    const data = await refreshTokenServices(
      decoded.staff_id,
      token,
      decoded.exp - decoded.iat
    );
    res.status(200).json({ data });
  }
};

module.exports = {
  login,
  getAccount,
  refreshToken,
};
