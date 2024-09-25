const TABLE_NAME = "discount";
const config = require("../db/config");
const helper = require("../utils/helper");
const cloudinary = require("../cloudinary/config");
const {
  getAllRecordV2,
  getRecordV2,
  getRecordByIdV2,
  getTotalRecordV2,
  insertRecordV2,
  updateRecordByIdV2,
  checkRecordExistsV2,
} = require("../utils/sqlFunctions");

const getAllDiscountServices = async () => {
  try {
    const rows = await getAllRecordV2({
      fields:
        "id as value , CONCAT (name,' - giảm tối đa ', percent, '%') as title ",
      table: TABLE_NAME,
      conditions: "is_status = 1",
    });
    const data = helper.emptyOrRows(rows);
    return {
      status: 200,
      data,
    };
  } catch (error) {
    return {
      message: "Error while getting discount",
    };
  }
};

const getDiscountServices = async (query) => {
  let { search, order, sort, page, limit } = query;

  page = page ? page : 1;
  limit = limit ? limit : config.listPerPage;
  const offset = helper.getOffSet(page, limit);

  try {
    const rows = await getRecordV2({
      fields:
        "id, name,  CONCAT (percent, '%') as percent , thumbnail, start_time, end_time, is_status",
      table: TABLE_NAME,
      sort: sort ? sort : "id",
      order_by: order ? order : "asc",
      limit,
      offset,
      searchColumn: "name",
      searchString: search,
    });
    const data = helper.emptyOrRows(rows);

    const totalRows = await getTotalRecordV2({
      table: TABLE_NAME,
      searchColumn: "name",
      searchString: search,
    });
    const totalPage = Math.round(totalRows / limit, 0);
    const pagination = {
      rowsPerPage: +limit,
      totalRows,
      totalPage,
      pageCurrent: +page,
    };

    return {
      status: 200,
      data,
      pagination,
    };
  } catch (error) {
    return { message: "Error while getting discount" };
  }
};

const getDiscountByIdServices = async (id) => {
  try {
    const discount = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });

    if (!discount) {
      return { status: 404, message: "Discount not exist!" };
    } else {
      const rows = await getRecordByIdV2({
        fields:
          "id, name, slug, percent, start_time, end_time, thumbnail, description, is_status",
        table: TABLE_NAME,
        id,
      });
      const data = helper.emptyOrRows(rows);
      return {
        status: 200,
        data,
      };
    }
  } catch (error) {
    return { message: "Error while getting discount" };
  }
};

const createDiscountServices = async (newDiscount) => {
  try {
    const result = await insertRecordV2({
      table: TABLE_NAME,
      record: newDiscount,
    });

    if (result.affectedRows) {
      return {
        status: 201,
        message: "Discount created successfully",
      };
    } else {
      return {
        status: 500,
        message: "Error while creating discount",
      };
    }
  } catch (error) {
    return {
      message: "Error while creating discount",
    };
  }
};

const updateDiscountByIdServices = async (id, newDiscount) => {
  try {
    const discount = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });

    if (!discount) {
      return {
        status: 404,
        message: "Discount not exist!",
      };
    } else {
      if (discount?.cloudinary_id) {
        if (newDiscount.thumbnail === "") {
          await cloudinary.uploader.destroy(discount?.cloudinary_id);
        } else {
          if (
            discount?.thumbnail &&
            newDiscount.thumbnail !== discount?.thumbnail
          ) {
            await cloudinary.uploader.destroy(discount?.cloudinary_id);
          }
        }
      }

      const result = await updateRecordByIdV2({
        table: TABLE_NAME,
        record: newDiscount,
        id,
      });

      if (result?.affectedRows) {
        return {
          status: 200,
          message: "Discount updated successfully",
        };
      } else {
        return {
          status: 500,
          message: "Error in updating Discount",
        };
      }
    }
  } catch (error) {
    return {
      message: "Error in updating Discount",
    };
  }
};

const quickUpdateDiscountServices = async (data) => {
  try {
    let isFlag = false;
    for (let i = 0; i < data.length; i++) {
      let id = data[i]?.id;
      let is_status = data[i]?.is_status;

      if (!id) {
        return {
          status: 400,
          message: "Invalid information",
        };
      } else {
        let discount = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "id",
          value: id,
        });

        if (!discount) {
          return {
            status: 404,
            message: "Discount not exist!",
          };
        } else {
          let newDiscount = {};
          if (discount.is_status !== is_status) newDiscount = { is_status };

          if (!Object.keys(newDiscount).length > 0) {
            continue;
          } else {
            const result = await updateRecordByIdV2({
              table: TABLE_NAME,
              record: newDiscount,
              id,
            });

            if (result.affectedRows) {
              isFlag = true;
            } else {
              return {
                message: "Error in updating Discount",
              };
            }
          }
        }
      }
    }

    if (isFlag) {
      return {
        status: 200,
        message: "Discount updated successfully",
      };
    } else {
      return {
        flag: true,
        status: 200,
        message: "No changes detected",
      };
    }
  } catch (error) {
    return {
      message: "Error in updating Discount",
    };
  }
};

module.exports = {
  getDiscountServices,
  getAllDiscountServices,
  getDiscountByIdServices,
  createDiscountServices,
  updateDiscountByIdServices,
  quickUpdateDiscountServices,
};
