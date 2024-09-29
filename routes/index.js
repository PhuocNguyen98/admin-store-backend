const express = require("express");
const routes = express.Router();

routes.use("/v1/api", require("./v1/authRoutes"));
routes.use("/v1/api/category", require("./v1/categoryRoutes"));
routes.use("/v1/api/supplier", require("./v1/supplierRoutes"));
routes.use("/v1/api/discount", require("./v1/discountRoutes"));
routes.use("/v1/api/product", require("./v1/productRoutes"));
routes.use("/v1/api/staff", require("./v1/staffRoutes"));
routes.use("/v1/api/user", require("./v1/userRoutes"));

module.exports = routes;
