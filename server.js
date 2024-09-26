const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT;
const bodyParser = require("body-parser");

//Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const discountRoutes = require("./routes/discountRoutes");
const productRoutes = require("./routes/productRoutes");
const staffRoutes = require("./routes/staffRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/v1/api", authRoutes);
app.use("/v1/api/category", categoryRoutes);
app.use("/v1/api/supplier", supplierRoutes);
app.use("/v1/api/discount", discountRoutes);
app.use("/v1/api/product", productRoutes);
app.use("/v1/api/staff", staffRoutes);
app.use("/v1/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
