const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const uploadAvatar = multer({ storage });
module.exports = uploadAvatar;
