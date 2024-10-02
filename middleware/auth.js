const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const allowRoutes = ["/login", "/account/token", "/account/logout"];
  if (allowRoutes.find((item) => `/v1/api${item}` === req.originalUrl)) {
    next();
  } else {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.staff = {
          staffId: decoded.staff_id,
        };
        next();
      } catch (error) {
        res.status(401).json({ message: "Token is expired and invalid" });
      }
    } else {
      res.status(401).json({
        message: "You have not transmitted the token or the token has expired",
      });
    }
  }
};

module.exports = auth;
