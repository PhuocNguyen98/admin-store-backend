const helper = require("../utils/helper");
const dayjs = require("dayjs");
const {
  getAllDiscountServices,
  getDiscountServices,
  getDiscountByIdServices,
  createDiscountServices,
  updateDiscountByIdServices,
  quickUpdateDiscountServices,
} = require("../services/discountServices");

const getDiscount = async (req, res) => {
  const query = req.query;
  if (!Object.keys(query).length > 0) {
    const data = await getAllDiscountServices();
    res.status(200).json({ data });
  } else {
    const data = await getDiscountServices(query);
    res.status(200).json({ data });
  }
};

const getDiscountById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await getDiscountByIdServices(id);
    res.status(200).json({ data });
  }
};

const createDiscount = async (req, res) => {
  const {
    discountName: name,
    discountSlug: slug,
    discountPercent: percent,
    discountStartTime: start_time,
    discountEndTime: end_time,
    discountDescription: description,
  } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: "Name, Slug fields cannot be empty!" });
  } else {
    let newDiscount = {
      name,
      slug,
      percent,
      description,
      start_time: dayjs(start_time).format("DD-MM-YYYY"),
      end_time: dayjs(end_time).format("DD-MM-YYYY"),
      is_status: 0, // { 0: chưa áp dụng, 1: đang áp dụng} => mặc định khi thêm mới sẽ là 0
      created_at: helper.getTimes(),
    };

    if (req?.file && Object.keys(req.file).length > 0) {
      newDiscount = {
        ...newDiscount,
        thumbnail: req.file?.path,
        cloudinary_id: req.file?.filename,
      };
    }
    const data = await createDiscountServices(newDiscount);
    res.status(200).json({ data });
  }
};

const updateDiscountById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const {
      discountName: name,
      discountSlug: slug,
      discountPercent: percent,
      discountStartTime: start_time,
      discountEndTime: end_time,
      discountDescription: description,
      discountImage: thumbnail,
      discountStatus: is_status,
    } = req.body;
    if (!name || !slug || !is_status) {
      res.status(400).json({
        message: "Name, Slug, Status fields cannot be empty!",
      });
    } else {
      let newDiscount = {
        name,
        slug,
        percent,
        start_time: dayjs(start_time).format("DD-MM-YYYY"),
        end_time: dayjs(end_time).format("DD-MM-YYYY"),
        is_status,
        description,
        updated_at: helper.getTimes(),
      };

      // Image deleted
      if (thumbnail === "" || thumbnail === undefined || thumbnail === null) {
        newDiscount = {
          ...newDiscount,
          thumbnail: "",
          cloudinary_id: "",
        };
      } else {
        // Keep image old
        newDiscount = {
          ...newDiscount,
          thumbnail,
        };
      }

      if (req.file && Object.keys(req.file).length > 0) {
        Object.assign(newDiscount, {
          thumbnail: req.file?.path,
          cloudinary_id: req.file?.filename,
        });
      }

      const data = await updateDiscountByIdServices(id, newDiscount);
      res.status(200).json({ data });
    }
  }
};

const quickUpdateDiscount = async (req, res) => {
  const formList = req.body?.formList;
  if (!formList.length > 0) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const data = await quickUpdateDiscountServices(formList);
    res.status(200).json({ data });
  }
};

module.exports = {
  getDiscount,
  getDiscountById,
  createDiscount,
  updateDiscountById,
  quickUpdateDiscount,
};
