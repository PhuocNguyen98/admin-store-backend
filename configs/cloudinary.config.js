const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

function uploadCloud(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `uploads/${folderName.trim()}`,
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
