const helper = require("../utils/helper");
const {
  getCategoryServices,
  getAllCategoryServices,
  getCategoryByIdServices,
  createCategoryServices,
  updateCategoryByIdServices,
  quickUpdateCategoryServices,
} = require("../services/categoryServices");

const getCategory = async (req, res) => {
  const query = req.query;
  if (!Object.keys(query).length > 0) {
    const data = await getAllCategoryServices();
    res.status(200).json({ data });
  } else {
    const data = await getCategoryServices(query);
    res.status(200).json({ data });
  }
};

const getCategoryById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await getCategoryByIdServices(id);
    res.status(200).json({ data });
  }
};

const createCategory = async (req, res) => {
  const { categoryName: name, categorySlug: slug } = req.body;
  if (!name || !slug) {
    res.status(400).json({ message: "Name, Slug fields cannot be empty!" });
  } else {
    let newCategory = {
      name,
      slug,
      is_status: 1, // { 0: là ngừng kinh doanh, 1: Đang kinh doanh} => mặc định khi thêm mới sẽ là 1
      is_display: 0, // { 0: Ẩn, 1: Hiển thị} => mặc định khi thêm mới sẽ là 0
      created_at: helper.getTimes(),
    };

    if (req?.file && Object.keys(req.file).length > 0) {
      newCategory = {
        ...newCategory,
        thumbnail: req.file?.path,
        cloudinary_id: req.file?.filename,
      };
    }
    const data = await createCategoryServices(newCategory);
    res.status(200).json({ data });
  }
};

const updateCategoryById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const {
      categoryName: name,
      categorySlug: slug,
      categoryStatus: is_status,
      categoryDisplay: is_display,
    } = req.body;
    if (!name || !slug || !is_status || !is_display) {
      res.status(400).json({
        message: "Name, Slug, Status, Display fields cannot be empty!",
      });
    } else {
      let newCategory = {
        name,
        slug,
        is_status,
        is_display,
        updated_at: helper.getTimes(),
      };

      if (req.file && Object.keys(req.file).length > 0) {
        newCategory = {
          ...newCategory,
          thumbnail: req.file?.path,
          cloudinary_id: req.file?.filename,
        };
      }
      const data = await updateCategoryByIdServices(id, newCategory);
      res.status(200).json({ data });
    }
  }
};

const quickUpdateCategory = async (req, res) => {
  const formList = req.body?.formList;
  if (!formList.length > 0) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const data = await quickUpdateCategoryServices(formList);
    res.status(200).json({ data });
  }
};

module.exports = {
  getCategory,
  getCategoryById,
  createCategory,
  updateCategoryById,
  quickUpdateCategory,
};
