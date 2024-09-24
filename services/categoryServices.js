const TABLE_NAME = "product_category";
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

const getAllCategoryServices = async () => {
  try {
    const rows = await getAllRecordV2({
      fields: "id as value , name as title ",
      table: TABLE_NAME,
    });
    const data = helper.emptyOrRows(rows);
    return {
      status: 200,
      data,
    };
  } catch (error) {
    return {
      message: "Error while getting category",
    };
  }
};

const getCategoryServices = async (query) => {
  let { search, order, sort, page, limit } = query;

  page = page ? page : 1;
  limit = limit ? limit : config.listPerPage;
  const offset = helper.getOffSet(page, limit);

  try {
    const rows = await getRecordV2({
      fields: "id, name, thumbnail, is_status, is_display",
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
    return { message: "Error while getting category" };
  }
};

const getCategoryByIdServices = async (id) => {
  try {
    const category = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });

    if (!category) {
      return { status: 404, message: "Category not exist!" };
    } else {
      const rows = await getRecordByIdV2({
        fields: "id, name, slug, thumbnail, is_status",
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
    return { message: "Error while getting category" };
  }
};

const createCategoryServices = async (newCategory) => {
  try {
    const result = await insertRecordV2({
      table: TABLE_NAME,
      record: newCategory,
    });

    if (result.affectedRows) {
      return {
        status: 201,
        message: "Category created successfully",
      };
    } else {
      return {
        status: 500,
        message: "Error while creating category",
      };
    }
  } catch (error) {
    return {
      message: "Error while creating category",
    };
  }
};

const updateCategoryByIdServices = async (id, newCategory) => {
  try {
    const category = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });
    if (!category) {
      return {
        status: 404,
        message: "Category not exist!",
      };
    } else {
      if (newCategory.thumbnail === "") {
        await cloudinary.uploader.destroy(category?.cloudinary_id);
      } else {
        if (
          category?.thumbnail &&
          newCategory.thumbnail !== category?.thumbnail
        ) {
          await cloudinary.uploader.destroy(category?.cloudinary_id);
        }
      }

      const result = await updateRecordByIdV2({
        table: TABLE_NAME,
        record: newCategory,
        id,
      });

      if (result?.affectedRows) {
        return {
          status: 200,
          message: "Category updated successfully",
        };
      } else {
        return {
          status: 500,
          message: "Error in updating Category",
        };
      }
    }
  } catch (error) {
    return {
      message: "Error in updating Category",
    };
  }
};

const quickUpdateCategoryServices = async (data) => {
  try {
    let isFlag = false;
    for (let i = 0; i < data.length; i++) {
      let id = data[i]?.id;
      let is_status = data[i]?.is_status;
      let is_display = data[i]?.is_display;

      if (!id) {
        return {
          status: 400,
          message: "Invalid information",
        };
      } else {
        let category = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "id",
          value: id,
        });

        if (!category) {
          return {
            status: 404,
            message: "Category not exist!",
          };
        } else {
          let newCategory = {};
          if (category.is_status !== is_status) newCategory = { is_status };
          if (category.is_display !== is_display)
            newCategory = { ...newCategory, is_display };

          if (!Object.keys(newCategory).length > 0) {
            continue;
          } else {
            const result = await updateRecordByIdV2({
              table: TABLE_NAME,
              record: newCategory,
              id,
            });

            if (result.affectedRows) {
              isFlag = true;
            } else {
              return {
                message: "Error in updating Category",
              };
            }
          }
        }
      }
    }

    if (isFlag) {
      return {
        status: 200,
        message: "Category updated successfully",
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
      message: "Error in updating Category",
    };
  }
};

module.exports = {
  getCategoryServices,
  getAllCategoryServices,
  getCategoryByIdServices,
  createCategoryServices,
  updateCategoryByIdServices,
  quickUpdateCategoryServices,
};
