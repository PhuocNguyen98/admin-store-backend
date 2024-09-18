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

function handleArrayImages(arrayImages) {
  let newArray = [];
  if (arrayImages.length > 0) {
    for (let i = 0; i < arrayImages.length; i++) {
      let key = arrayImages[i].filename;
      let value = arrayImages[i].path;
      let object = {
        [key]: value,
      };
      newArray.push(object);
    }
  }
  return newArray;
}

const getProduct = async (req, res) => {
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
      "product",
      order,
      sort,
      limit,
      offset,
      (searchField = "name"),
      (searchString = search)
    );

    const totalRows = await getTotalRecord("product", "name", search);
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
      .json({ status: 500, message: `Error while getting product` });
  }
};

const getProductById = async (req, res) => {
  const id = req.params?.id;
  if (id) {
    try {
      const rows = await getRecordById("product", id);
      let data = helper.emptyOrRows(rows);
      let images = Object.values(data[0].images);

      let arrayImages = [];
      images.forEach((item) => {
        arrayImages.push(Object.values(item));
      });

      data[0].images = arrayImages;

      res.status(200).json({ status: 200, data });
    } catch (error) {
      res
        .status(500)
        .json({ status: 500, message: `Error while getting product` });
    }
  } else {
    res.status(500).json({ status: 500, message: `Can not found product` });
  }
};

const createProduct = async (req, res) => {
  const {
    productName: name,
    productSlug: slug,
    productSku: sku,
    productPrice: price,
    productInventory: inventory,
    productSupplier: supplier_id,
    productCategory: category_id,
    productDiscount: discount_id,
    productSpecifications: specifications,
    productDescription: description,
  } = req.body;

  let newProduct = {
    name,
    slug,
    sku,
    price,
    inventory,
    supplier_id,
    category_id,
    discount_id,
    specifications,
    description,
    created_at: helper.getTimes(),
  };

  if (Object.keys(req.files).length > 0) {
    const files = req.files;
    if (files["productThumbnail"] && files["productThumbnail"].length > 0) {
      const thumbnail = files["productThumbnail"][0].path;
      const cloudinary_id = files["productThumbnail"][0].filename; // => lưu cloud_id cho thumbnail
      newProduct = {
        ...newProduct,
        thumbnail,
        cloudinary_id,
      };
    }

    // Lưu dưới dạng JSON, lấy Cloud_id làm key, path làm value
    if (files["productImages"].length && files["productImages"].length > 0) {
      let images = handleArrayImages(files["productImages"]);
      images = JSON.stringify(images);
      newProduct = {
        ...newProduct,
        images,
      };
    }
  }
  let message = "Error in creating Product";

  try {
    const result = await insertRecord("product", newProduct);
    if (result.affectedRows) {
      message = "Product created successfully";
    }
    res.status(200).json({ status: 200, message });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
};

const updateProductById = async (req, res) => {
  const { id } = req.params;
  let message = "Error in updating Product";
  if (id) {
    try {
      const product = await checkRecordExists("product", "id", id);
      let imagesProductOld = Object.values(product.images);
      if (product) {
        const {
          productName: name,
          productSlug: slug,
          productSku: sku,
          productPrice: price,
          productInventory: inventory,
          productSupplier: supplier_id,
          productCategory: category_id,
          productDiscount: discount_id,
          productSpecifications: specifications,
          productDescription: description,
          productImages,
        } = req.body;

        let dataProduct = {
          name,
          slug,
          sku,
          price,
          inventory,
          supplier_id,
          category_id,
          discount_id,
          specifications,
          description,
          updated_at: helper.getTimes(),
        };

        // XỬ LÝ THUMBNAIL CỦA PRODUCT
        if (Object.keys(req.files).length > 0) {
          let files = req.files;
          if (
            files["productThumbnail"] &&
            files["productThumbnail"].length > 0
          ) {
            let result = await cloudinary.uploader.destroy(
              product.cloudinary_id
            );
            // console.log(result);
            let thumbnail = files["productThumbnail"][0].path;
            let cloudinary_id = files["productThumbnail"][0].filename;
            dataProduct = {
              ...dataProduct,
              thumbnail,
              cloudinary_id,
            };
          }
        }

        // XỬ LÝ IMAGES CỦA PRODUCT
        let images = [];
        if (productImages !== "") {
          // Có nhiều hơn 1 phần tử trong productImages => mảng
          if (typeof productImages === "object") {
            // Nếu là mảng thì rải vào
            images = [...productImages];
          } // Chỉ có 1 phần tử trong productImages => string
          else if (typeof productImages === "string") {
            images.push(productImages);
          }
        }

        // XỬ LÝ CHUYỂN TỪ ARRAY => ARRAY OBJECT
        if (images.length > 0) {
          let newImages = [];
          for (let i = 0; i < images.length; i++) {
            let key = images[i].slice(images[i].indexOf("product"));
            key = key.slice(0, key.indexOf("."));
            let value = images[i];
            let obj = {
              [key]: value,
            };
            newImages.push(obj);
          }
          images = [...newImages];
        }

        /** KHI KHÔNG CÓ ẢNH IMAGES CỦA PRODUCT TRONG DATABASE */
        if (imagesProductOld.length === 0 && images.length === 0) {
          // TH1: KHÔNG UPDATE ẢNH
          // console.log("Database không có ảnh và cũng không có update ảnh");

          // TH2: CÓ UPDATE ẢNH
          if (Object.keys(req.files).length > 0) {
            let files = req.files;
            if (files["productImages"] && files["productImages"].length > 0) {
              // console.log(`Database không có ảnh và thêm  ảnh mới`);
              let arrayImages = handleArrayImages(files["productImages"]);
              images = [...arrayImages];
            }
          }
        }

        /**  BAN ĐẦU CÓ ẢNH IMAGES CỦA PRODUCT TRONG DATABSE, KHÔNG XÓA ẢNH CŨ, CHỈ THÊM ẢNH MỚI */
        if (images.length !== 0 && images.length === imagesProductOld.length) {
          // THÊM ẢNH MỚI
          if (Object.keys(req.files).length > 0) {
            let files = req.files;
            if (files["productImages"] && files["productImages"].length > 0) {
              // console.log(`Database có ảnh và thêm  ảnh mới`);
              let arrayImages = handleArrayImages(files["productImages"]);
              images = [...images, ...arrayImages];
            }
          }
        }

        /**  BAN ĐẦU CÓ ẢNH IMAGES CỦA PRODUCT TRONG DATABSE, XÓA ẢNH CŨ VÀ THÊM ẢNH MỚI( nếu có) */
        if (images.length < imagesProductOld.length) {
          let imagesDeleted = imagesProductOld;

          // Xác định các ảnh cần xóa
          if (images.length > 0) {
            for (let i = 0; i < imagesProductOld.length; i++) {
              for (let j = 0; j < images.length; j++) {
                if (
                  Object.values(imagesProductOld[i])[0] ===
                  Object.values(images[j])[0]
                ) {
                  imagesDeleted.splice(i, 1); // Trả về danh sách các phần tử bị xóa
                }
              }
            }
          }

          // Xóa các file cần xóa trên cloudinary
          if (imagesDeleted.length > 0) {
            // console.log(`Xóa ${imagesDeleted.length} ảnh`);
            for (let i = 0; i < imagesDeleted.length; i++) {
              let public_id = Object.keys(imagesDeleted[i])[0];
              // console.log(public_id);
              let result = await cloudinary.uploader.destroy(public_id);
              // console.log(result);
            }
          }

          // THÊM ẢNH MỚI VÀO IMAGES CỦA PRODUCT( nếu có)
          if (Object.keys(req.files).length > 0) {
            let files = req.files;
            if (files["productImages"] && files["productImages"].length > 0) {
              // console.log(`Database có ảnh và thêm  ảnh mới`);
              let arrayImages = handleArrayImages(files["productImages"]);
              images = [...images, ...arrayImages];
            }
          }
        }

        // console.log(images, "Images");
        images = JSON.stringify(images);
        dataProduct = { ...dataProduct, images };
        // console.log(dataProduct);

        const result = await updateRecordById("product", dataProduct, id);
        if (result.affectedRows) {
          message = "Product updated successfully";
        }
        res.status(200).json({ status: 200, message });
      } else {
        res.status(500).json({ status: 500, message: "Product not exist" });
      }
    } catch (error) {
      res.status(500).json({ status: 500, message });
    }
  } else {
    res.status(500).json({ status: 500, message: "Product not found" });
  }
};

module.exports = {
  getProduct,
  createProduct,
  getProductById,
  updateProductById,
};
