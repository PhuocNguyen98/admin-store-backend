const helper = require("../utils/helper");
const cloudinary = require("../cloudinary/config");
const {
  getProductServices,
  getProductByIdServices,
  createProductServices,
  updateProductByIdServices,
  quickUpdateProductServices,
} = require("../services/productServices");

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
  const data = await getProductServices(req.query);
  res.status(200).json({ data });
};

const getProductById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
    const data = await getProductByIdServices(id);
    res.status(200).json({ data });
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

  if (!name || !slug || !category_id || !supplier_id) {
    res.status(400).json({
      message: "Name, Slug, Category, Supplier fields cannot be empty!",
    });
  } else {
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
      is_status: 1, //{0: Ngừng kinh doanh | 1: Đang kinh doanh} => Mặc định khi tạo mới sản phẩm sẽ là 1
      is_display: 0, // { 0: Không hiển thị | 1: Đang hiển thị}  => Mặc định khi tạo mới sản phẩm sẽ là 0
      created_at: helper.getTimes(),
    };

    if (req.files && Object.keys(req.files).length > 0) {
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

      // Lưu dưới dạng key-value, lấy Cloud_id làm key, path làm value
      if (files["productImages"].length && files["productImages"].length > 0) {
        let images = handleArrayImages(files["productImages"]);
        images = JSON.stringify(images);
        newProduct = {
          ...newProduct,
          images,
        };
      }
    }

    const data = await createProductServices(newProduct);
    res.status(200).json({ data });
  }
};

const updateProductById = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    res.status(400).json({ status: 400, message: `Invalid information!` });
  } else {
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
      productStatus: is_status,
      productDisplay: is_display,
      productThumbnail: thumbnail,
      productImages,
    } = req.body;

    if (!name || !slug || !category_id || !supplier_id) {
      res.status(400).json({
        message: "Name, Slug, Category, Supplier fields cannot be empty!",
      });
    } else {
      const product = await getProductByIdServices(id);
      if (product?.status !== 200) {
        res.status(200).json({ data: product });
      } else {
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
          is_status,
          is_display,
          updated_at: helper.getTimes(),
        };

        try {
          //**----------------------------- XỬ LÝ HÌNH ẢNH --------------------------------- */
          let thumbnailProductOld = product.data[0]?.thumbnail;
          let cloudinaryProductOld = product.data[0]?.cloudinary_id;
          let imagesProductOld = product.data[0]?.images ?? [];
          let productSlug = product.data[0]?.slug;

          // XỬ LÝ THUMBNAIL CỦA PRODUCT
          // THÊM THUMBNAIL
          if (Object.keys(req.files).length > 0) {
            let files = req.files;
            if (
              files["productThumbnail"] &&
              files["productThumbnail"].length > 0
            ) {
              // XÓA THUMBNAIL NẾU CÓ
              if (thumbnailProductOld && cloudinaryProductOld) {
                let result = await cloudinary.uploader.destroy(
                  cloudinaryProductOld
                );
                // console.log(result);
              }
              let thumbnail = files["productThumbnail"][0]?.path;
              let cloudinary_id = files["productThumbnail"][0]?.filename;
              dataProduct = {
                ...dataProduct,
                thumbnail,
                cloudinary_id,
              };
            }
          } else {
            // KHÔNG THÊM ẢNH MỚI , MÀ CÒN XÓA ẢNH CŨ
            if (!thumbnail || thumbnail !== thumbnailProductOld) {
              // XÓA THUMBNAIL
              if (thumbnailProductOld && cloudinaryProductOld) {
                let result = await cloudinary.uploader.destroy(
                  cloudinaryProductOld
                );
                // console.log(result);
              }
              dataProduct = {
                ...dataProduct,
                thumbnail: "",
                cloudinary_id: "",
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
          if (
            images.length !== 0 &&
            images.length === imagesProductOld.length
          ) {
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
                  if (imagesProductOld[i] === Object.values(images[j])[0]) {
                    imagesDeleted.splice(i, 1); // Trả về danh sách các phần tử bị xóa
                  }
                }
              }
            }

            // Xóa các file cần xóa trên cloudinary
            if (imagesDeleted.length > 0) {
              // console.log(`Xóa ${imagesDeleted.length} ảnh`);
              for (let i = 0; i < imagesDeleted.length; i++) {
                let linkImage = imagesDeleted[i];
                let public_id = linkImage.slice(
                  linkImage.indexOf(`product/${productSlug}`),
                  linkImage.lastIndexOf(".")
                );
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
        } catch (error) {
          res.status(500).json({
            data: { status: 500, message: "Error processing image upload" },
          });
        }

        const data = await updateProductByIdServices(id, dataProduct);
        res.status(200).json({ data });
      }
    }
  }
};

const quickUpdateProduct = async (req, res) => {
  const formList = req.body?.formList;
  if (!formList.length > 0) {
    res.status(400).json({ status: 400, message: "Invalid information" });
  } else {
    const data = await quickUpdateProductServices(formList);
    res.status(200).json({ data });
  }
};

module.exports = {
  getProduct,
  createProduct,
  getProductById,
  updateProductById,
  quickUpdateProduct,
};
