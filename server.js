const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const database = require("./db/sqlConnection");

//Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const discountRoutes = require("./routes/discountRoutes");
const productRoutes = require("./routes/productRoutes");
const staffRoutes = require("./routes/staffRoutes");
const userRoutes = require("./routes/userRoutes");

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

app.get("/", (res, req) => {
  req.json({ message: "Wellcom to backend" });
});

app.get("/getMysqlStatus", (req, res) => {
  // Create Route to Check mysql server Active or Not.

  database.ping((err) => {
    if (err) return res.status(500).send("MySQL Server is Down");

    res.send("MySQL Server is Active");
  });
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
