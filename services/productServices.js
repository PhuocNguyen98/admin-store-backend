const TABLE_NAME = "product";
const config = require("../db/config");
const helper = require("../utils/helper");
const {
  getRecordV2,
  getRecordByIdV2,
  getTotalRecordV2,
  insertRecordV2,
  updateRecordByIdV2,
  checkRecordExistsV2,
} = require("../utils/sqlFunctions");

const getProductServices = async (query) => {
  let { search, order, sort, page, limit } = query;

  page = page ? page : 1;
  limit = limit ? limit : config.listPerPage;
  const offset = helper.getOffSet(page, limit);

  try {
    let fields = `product.id, product.name, product.price, product.inventory, product.thumbnail, product.is_status, product.is_display,
    product_category.name as category, product_supplier.name as supplier`;

    let joinTable = `inner join product_category on product.category_id = product_category.id 
    inner join product_supplier on product.supplier_id = product_supplier.id`;

    const rows = await getRecordV2({
      fields,
      table: TABLE_NAME,
      joinTable,
      sort: sort ? sort : "product.id",
      order_by: order ? order : "asc",
      limit,
      offset,
      searchColumn: "product.name",
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
    return { message: "Error while getting product" };
  }
};

const getProductByIdServices = async (id) => {
  try {
    const product = await checkRecordExistsV2({
      table: TABLE_NAME,
      column: "id",
      value: id,
    });
    if (!product) {
      return { status: 404, message: "Product not exist!" };
    } else {
      let fields = `id, name, slug, sku, price, thumbnail, images, cloudinary_id,
          category_id as category, supplier_id as supplier, discount_id as discount,
          specifications, description, is_display, is_status`;

      const rows = await getRecordByIdV2({
        fields,
        table: TABLE_NAME,
        id,
      });
      let data = helper.emptyOrRows(rows);

      // Convert images database from object to array
      if (data[0].images) {
        let images = Object.values(data[0].images);
        let arrayImages = [];
        images.forEach((item) => {
          arrayImages.push(Object.values(item)[0]);
        });
        data[0].images = arrayImages;
      }

      return {
        status: 200,
        data,
      };
    }
  } catch (error) {
    return { message: "Error while getting product" };
  }
};

const createProductServices = async (newProduct) => {
  try {
    const result = await insertRecordV2({
      table: TABLE_NAME,
      record: newProduct,
    });

    if (result.affectedRows) {
      return {
        status: 201,
        message: "Product created successfully",
      };
    } else {
      return {
        status: 500,
        message: "Error while creating product",
      };
    }
  } catch (error) {
    return {
      message: "Error while creating product",
    };
  }
};

const updateProductByIdServices = async (id, data) => {
  try {
    const result = await updateRecordByIdV2({
      table: TABLE_NAME,
      record: data,
      id,
    });
    if (result?.affectedRows) {
      return {
        status: 200,
        message: "Product updated successfully",
      };
    } else {
      return {
        status: 500,
        message: "Error in updating Product",
      };
    }
  } catch (error) {
    return {
      message: "Error while updating product",
    };
  }
};

const quickUpdateProductServices = async (data) => {
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
        let product = await checkRecordExistsV2({
          table: TABLE_NAME,
          column: "id",
          value: id,
        });

        if (!product) {
          return {
            status: 404,
            message: "Product not exist!",
          };
        } else {
          let newProduct = {};
          if (product.is_status !== is_status) newProduct = { is_status };
          if (product.is_display !== is_display)
            newProduct = { ...newProduct, is_display };

          if (!Object.keys(newProduct).length > 0) {
            continue;
          } else {
            const result = await updateRecordByIdV2({
              table: TABLE_NAME,
              record: newProduct,
              id,
            });

            if (result.affectedRows) {
              isFlag = true;
            } else {
              return {
                message: "Error in updating Product",
              };
            }
          }
        }
      }
    }

    if (isFlag) {
      return {
        status: 200,
        message: "Product updated successfully",
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
      message: "Error while updating product",
    };
  }
};

module.exports = {
  getProductServices,
  getProductByIdServices,
  createProductServices,
  updateProductByIdServices,
  quickUpdateProductServices,
};
