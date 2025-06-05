const multer = require("multer");

const storage = multer.memoryStorage(); // File is stored in memory for direct S3 upload
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
