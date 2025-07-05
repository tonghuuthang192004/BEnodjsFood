
// const multer=require('multer')
// const path = require('path');
// module.exports=()=>{
//     const storage = multer.diskStorage({

//   destination: function (req, file, cb) {
//     cb(null, path.join( __dirname,'../public/uploads/'))
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() ;
//     cb(null,`${uniqueSuffix}-${file.originalname}`)
//   }
  
// })
// return storage;
// }
const multer = require('multer');
const path = require('path');

module.exports = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads/')); // Thư mục lưu
    },
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = path.basename(file.originalname, ext)
        .replace(/[^a-z0-9]/gi, '_') // 🧹 Loại bỏ ký tự đặc biệt
        .toLowerCase();
      cb(null, `${timestamp}-${safeName}${ext}`);
    },
  });

  return storage;
};
