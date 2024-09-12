const helper = require("../utils/helper");
const config = require("../db/config");
const cloudinary = require("../cloudinary/config");
const {
  getTotalRecord,
  getRecord,
  getRecordById,
  insertRecord,
  updateRecordById,
  checkRecordExists,
} = require("../utils/sqlFunctions");
const dayjs = require("dayjs");

const getDiscount = async (req, res) => {
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
      "discount",
      order,
      sort,
      limit,
      offset,
      (searchField = "name"),
      (searchString = search)
    );

    const totalRows = await getTotalRecord("discount", "name", search);
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
      .json({ status: 500, message: `Error while getting discount` });
  }
};

const getDiscountById = async (req, res) => {
  const id = req.params.id;
  if (id) {
    const rows = await getRecordById("discount", id);
    const data = helper.emptyOrRows(rows);

    res.status(200).json({ status: 200, data });
  } else {
    res
      .status(500)
      .json({ status: 500, message: `Error while getting discount` });
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

  let newDiscount = {
    name,
    slug,
    percent,
    start_time: dayjs(start_time).format("DD-MM-YYYY"),
    end_time: dayjs(end_time).format("DD-MM-YYYY"),
    description,
    created_at: helper.getTimes(),
  };
  let message = "Error in creating Discount";

  try {
    if (req.file) {
      newDiscount = {
        ...newDiscount,
        thumbnail: req.file.path,
        cloudinary_id: req.file.filename,
      };
    }

    const result = await insertRecord("discount", newDiscount);
    if (result.affectedRows) {
      message = "Discount created successfully";
    }
    res.status(200).json({ status: 200, message });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateDiscountById = async (req, res) => {
  const id = req.params.id;
  let message = "Error in updating Discount";

  if (id) {
    const {
      discountName: name,
      discountSlug: slug,
      discountPercent: percent,
      discountStartTime: start_time,
      discountEndTime: end_time,
      discountDescription: description,
    } = req.body;
    let newDiscount = {
      name,
      slug,
      percent,
      start_time: dayjs(start_time).format("DD-MM-YYYY"),
      end_time: dayjs(end_time).format("DD-MM-YYYY"),
      description,
      updated_at: helper.getTimes(),
    };

    try {
      if (req.file) {
        const rows = await getRecordById("discount", id);
        const discount = helper.emptyOrRows(rows);

        if (discount[0].thumbnail && discount[0].cloudinary_id) {
          await cloudinary.uploader.destroy(discount[0].cloudinary_id);
        }

        newDiscount = {
          ...newDiscount,
          thumbnail: req.file.path,
          cloudinary_id: req.file.filename,
        };
      }

      const result = await updateRecordById("discount", newDiscount, id);
      if (result.affectedRows) {
        message = "Discount updated successfully";
      }
      res.status(200).json({ status: 200, message });
    } catch (error) {
      res.status(500).json({ status: 500, message });
    }
  } else {
    message = "Can not found discount";
    res.status(500).json({ status: 500, message });
  }
};

const updateDiscountStatusById = async (req, res) => {
  const data = req.body?.formList;
  if (data.length > 0) {
    let message = "Error in updating status Discount";
    let isUpdate = 0;

    for (let i = 0; i < data.length; i++) {
      let is_status = data[i]?.is_status;
      let id = data[i]?.id;
      try {
        const discount = await checkRecordExists("discount", "id", id);
        // Check discount exist
        if (Object.keys(discount).length > 0) {
          // Check is_status old AND is_status new
          if (discount.is_status === +is_status) {
            continue;
          } else {
            let discountStatus = {
              is_status,
            };
            const result = await updateRecordById(
              "discount",
              discountStatus,
              id
            );
            if (result.affectedRows) {
              isUpdate = isUpdate + 1;
            }
          }
        } else {
          message = "Discount not exist";
          res.status(500).json({ status: 500, message });
          break;
        }
      } catch (error) {
        res.status(500).json({ status: 500, error: error.message });
      }
    }

    if (isUpdate > 0) {
      message = "Discount updated successfully";
      res.status(200).json({ status: 200, message });
    } else {
      message = "No changes detected";
      res.status(200).json({ status: 200, message });
    }
  } else {
    message = "Error while update status discount";
    res.status(500).json({ status: 500, message });
  }
};

module.exports = {
  getDiscount,
  getDiscountById,
  createDiscount,
  updateDiscountById,
  updateDiscountStatusById,
};
