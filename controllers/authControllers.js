const {
  loginServices,
  getAccountServicesById,
} = require("../servives/authServices");

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

module.exports = {
  login,
  getAccount,
};
