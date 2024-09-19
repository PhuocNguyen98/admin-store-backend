const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT;

//Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const discountRoutes = require("./routes/discountRoutes");
const productRoutes = require("./routes/productRoutes");
const staffRoutes = require("./routes/staffRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoutes);
app.use("/category", categoryRoutes);
app.use("/supplier", supplierRoutes);
app.use("/discount", discountRoutes);
app.use("/product", productRoutes);
app.use("/staff", staffRoutes);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
