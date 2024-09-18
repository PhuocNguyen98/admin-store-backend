const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

function uploadCloud(folderName, isMultipleFile = false) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let folder = `${folderName.trim()}`;
      let public_id = `${Date.now()}_${file.originalname.slice(
        0,
        file.originalname.indexOf(".")
      )}`;
      // Check upload multiple file , if upload multiple file then create folder child with slug
      if (isMultipleFile) {
        const arrayKeys = Object.keys(req.body);
        if (arrayKeys.length > 0) {
          let slug = "";
          const keyItem = arrayKeys.find((item) => {
            return item.toLowerCase().indexOf("slug") !== -1;
          });
          if (keyItem) {
            slug = req.body[keyItem];
            folder += `/${slug}`;
          } else {
            folder += `/${public_id}`;
          }
        } else {
          folder += `/${public_id}`;
        }
      }

      return {
        folder,
        allowedFormats: ["jpeg", "png", "jpg"],
        public_id,
      };
    },
  });
  return multer({ storage });
}

module.exports = uploadCloud;
