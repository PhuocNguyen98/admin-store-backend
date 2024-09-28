const helper = require("../utils/helper");
const {
  getSupplierServices,
  getAllSupplierServices,
  createSupplierServices,
  getSupplierByIdServices,
  updateSupplierByIdServices,
  quickUpdateSupplierServices,
} = require("../services/supplierServices");

const getSupplier = async (req, res) => {
  const query = req.query;
  if (!Object.keys(query).length > 0) {
    const data = await getAllSupplierServices();
    res.status(200).json({ data });
  } else {
    const data = await getSupplierServices(query);
    res.status(200).json({ data });
  }
};

const getSupplierById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await getSupplierByIdServices(id);
    res.status(200).json({ data });
  }
};

const createSupplier = async (req, res) => {
  const { supplierName: name, supplierSlug: slug } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: "Name, Slug fields cannot be empty!" });
  } else {
    let newSupplier = {
      name,
      slug,
      thumbnail: "",
      cloudinary_id: "",
      is_status: 1, // { 0: là ngừng kinh doanh, 1: Đang kinh doanh} => mặc định khi thêm mới sẽ là 1
      is_display: 0, // { 0: Ẩn, 1: Hiển thị} => mặc định khi thêm mới sẽ là 0
      created_at: helper.getTimes(),
    };

    if (req?.file && Object.keys(req.file).length > 0) {
      newSupplier = {
        ...newSupplier,
        thumbnail: req.file?.path,
        cloudinary_id: req.file?.filename,
      };
    }
    const data = await createSupplierServices(newSupplier);
    res.status(200).json({ data });
  }
};

const updateSupplierById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const {
      supplierName: name,
      supplierSlug: slug,
      supplierStatus: is_status,
      supplierDisplay: is_display,
      supplierImage: thumbnail,
    } = req.body;
    if (!name || !slug || !is_status || !is_display) {
      res.status(400).json({
        message: "Name, Slug, Status, Display fields cannot be empty!",
      });
    } else {
      let newSupplier = {
        name,
        slug,
        is_status,
        is_display,
        updated_at: helper.getTimes(),
      };

      // Image deleted
      if (thumbnail === "" || thumbnail === undefined || thumbnail === null) {
        newSupplier = {
          ...newSupplier,
          thumbnail: "",
          cloudinary_id: "",
        };
      } else {
        // Keep image old
        newSupplier = {
          ...newSupplier,
          thumbnail,
        };
      }

      if (req.file && Object.keys(req.file).length > 0) {
        Object.assign(newSupplier, {
          thumbnail: req.file?.path,
          cloudinary_id: req.file?.filename,
        });
      }

      const data = await updateSupplierByIdServices(id, newSupplier);
      res.status(200).json({ data });
    }
  }
};

const quickUpdateSupplier = async (req, res) => {
  const formList = req.body?.formList;
  if (!formList.length > 0) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const data = await quickUpdateSupplierServices(formList);
    res.status(200).json({ data });
  }
};
module.exports = {
  getSupplier,
  getSupplierById,
  createSupplier,
  updateSupplierById,
  quickUpdateSupplier,
};
