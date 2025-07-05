const multer = require('multer');
const path = require('path');
const getStorage = require('./storge'); // file storage bạn đã viết

const upload = multer({
  storage: getStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép file ảnh JPG, JPEG, PNG, WEBP, HEIC, HEIF!'), false);
    }
  }
});

module.exports = upload;
