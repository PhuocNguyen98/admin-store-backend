const helper = require("../utils/helper");
const config = require("../db/config");
const cloudinary = require("../cloudinary/config");
const {
  getTotalRecord,
  getRecord,
  getRecordById,
  insertRecord,
  updateRecordById,
} = require("../utils/sqlFunctions");

const getSupplier = async (req, res) => {
  const {
    search = "",
    order,
    sort,
    page = 1,
    limit = config.listPerPage,
  } = req.query;
  const offset = helper.getOffSet(page, limit);

  try {
    const rows = await getRecord(
      "*",
      "product_supplier",
      order,
      sort,
      limit,
      offset,
      (searchField = "name"),
      (searchString = search)
    );

    const totalRows = await getTotalRecord("product_supplier", "name", search);
    const totalPage = Math.round(totalRows / limit, 0);

    const data = helper.emptyOrRows(rows);
    const pagination = {
      rowsPerPage: +limit,
      totalPage,
      totalRows,
    };

    res.status(200).json({ status: 200, data, pagination });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: `Error while getting supplier` });
  }
};

const getSupplierById = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const rows = await getRecordById("product_supplier", id);
    const data = helper.emptyOrRows(rows);

    res.status(200).json({ status: 200, data });
  } else {
    res
      .status(500)
      .json({ status: 500, message: `Error while getting supplier` });
  }
};

const createSupplier = async (req, res) => {
  const { supplierName: name, supplierSlug: slug } = req.body;
  let newSupplier = {
    name,
    slug,
    created_at: helper.getTimes(),
  };
  let message = "Error in creating Supplier";

  try {
    if (req.file) {
      newSupplier = {
        ...newSupplier,
        thumbnail: req.file.path,
        cloudinary_id: req.file.filename,
      };
    }

    const result = await insertRecord("product_supplier", newSupplier);
    if (result.affectedRows) {
      message = "Supplier created successfully";
    }
    res.status(200).json({ status: 200, message });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateSupplierById = async (req, res) => {
  const id = req.params.id;
  let message = "Error in updating Supplier";

  if (id) {
    const { supplierName: name, supplierSlug: slug } = req.body;
    let newSupplier = {
      name,
      slug,
      updated_at: helper.getTimes(),
    };

    try {
      if (req.file) {
        const rows = await getRecordById("product_supplier", id);
        const supplier = helper.emptyOrRows(rows);

        if (supplier[0].thumbnail && supplier[0].cloudinary_id) {
          await cloudinary.uploader.destroy(supplier[0].cloudinary_id);
        }

        newSupplier = {
          ...newSupplier,
          thumbnail: req.file.path,
          cloudinary_id: req.file.filename,
        };
      }

      const result = await updateRecordById(
        "product_supplier",
        newSupplier,
        id
      );
      if (result.affectedRows) {
        message = "Supplier updated successfully";
      }
      res.status(200).json({ status: 200, message });
    } catch (error) {
      res.status(500).json({ status: 500, message });
    }
  } else {
    message = "Can not found supplier";
    res.status(500).json({ status: 500, message });
  }
};

module.exports = {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplierById,
};
