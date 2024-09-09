const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

function uploadCloud(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `${folderName.trim()}`,
      allowedFormats: ["jpeg", "png", "jpg"],
      public_id: (req, file) =>
        `${Date.now()}_${file.originalname.slice(
          0,
          file.originalname.indexOf(".")
        )}`,
    },
  });
  return multer({ storage });
}

module.exports = uploadCloud;
