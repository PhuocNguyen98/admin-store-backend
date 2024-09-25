const TABLE_NAME = "product_supplier";
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

const getAllSupplierServices = async () => {
  try {
    const rows = await getAllRecordV2({
      fields: "id as value , name as title ",
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
      message: "Error while getting supplier",
    };
  }
};

const getSupplierServices = async (query) => {
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
    return { message: "Error while getting supplier" };
  }
};

const getSupplierByIdServices = async (id) => {
  try {
    const supplier = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });

    if (!supplier) {
      return { status: 404, message: "Supplier not exist!" };
    } else {
      const rows = await getRecordByIdV2({
        fields: "id, name, slug, thumbnail, is_status, is_display",
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
    return { message: "Error while getting supplier" };
  }
};

const createSupplierServices = async (newSupplier) => {
  try {
    const result = await insertRecordV2({
      table: TABLE_NAME,
      record: newSupplier,
    });

    if (result.affectedRows) {
      return {
        status: 201,
        message: "Supplier created successfully",
      };
    } else {
      return {
        status: 500,
        message: "Error while creating supplier",
      };
    }
  } catch (error) {
    return {
      message: "Error while creating supplier",
    };
  }
};

const updateSupplierByIdServices = async (id, newSupplier) => {
  try {
    const supplier = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });
    if (!supplier) {
      return {
        status: 404,
        message: "Supplier not exist!",
      };
    } else {
      if (supplier?.cloudinary_id) {
        if (newSupplier.thumbnail === "") {
          await cloudinary.uploader.destroy(supplier?.cloudinary_id);
        } else {
          if (
            supplier?.thumbnail &&
            newSupplier.thumbnail !== supplier?.thumbnail
          ) {
            await cloudinary.uploader.destroy(supplier?.cloudinary_id);
          }
        }
      }

      const result = await updateRecordByIdV2({
        table: TABLE_NAME,
        record: newSupplier,
        id,
      });

      if (result?.affectedRows) {
        return {
          status: 200,
          message: "Supplier updated successfully",
        };
      } else {
        return {
          status: 500,
          message: "Error in updating Supplier",
        };
      }
    }
  } catch (error) {
    return {
      message: "Error in updating Supplier",
    };
  }
};

const quickUpdateSupplierServices = async (data) => {
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
        let supplier = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "id",
          value: id,
        });

        if (!supplier) {
          return {
            status: 404,
            message: "Supplier not exist!",
          };
        } else {
          let newSupplier = {};
          if (supplier.is_status !== is_status) newSupplier = { is_status };
          if (supplier.is_display !== is_display)
            newSupplier = { ...newSupplier, is_display };

          if (!Object.keys(newSupplier).length > 0) {
            continue;
          } else {
            const result = await updateRecordByIdV2({
              table: TABLE_NAME,
              record: newSupplier,
              id,
            });

            if (result.affectedRows) {
              isFlag = true;
            } else {
              return {
                message: "Error in updating Supplier",
              };
            }
          }
        }
      }
    }

    if (isFlag) {
      return {
        status: 200,
        message: "Supplier updated successfully",
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
      message: "Error in updating Supplier",
    };
  }
};

module.exports = {
  getSupplierServices,
  getAllSupplierServices,
  getSupplierByIdServices,
  createSupplierServices,
  updateSupplierByIdServices,
  quickUpdateSupplierServices,
};
