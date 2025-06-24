const express = require('express');
const router = express.Router();
const controllerCategory = require('../../controllers/admin/category.controller');
const validate = require('../../validate/Category.validate');
const storageMulter = require('../../helper/storge');
const multer = require('multer');

// Cấu hình Multer để lưu trữ tệp
const upload = multer({ storage: storageMulter() });

// Route xử lý API
router.get('', controllerCategory.index);
router.put('/change-status/:status/:id_danh_muc', controllerCategory.changeStatus);
router.put('/change-multi', controllerCategory.changeMulti);
router.delete('/deleted/:id_danh_muc', controllerCategory.deleteId);
router.delete('/delete-multiple', controllerCategory.deleteMultiple);
router.get('/edit-Category/:id_danh_muc', controllerCategory.getEditCategory);

router.post(
  '/create-Category',
  upload.single('hinh_anh'),  // Xử lý ảnh tải lên
  validate.createPost,  // Validate dữ liệu đầu vào
  controllerCategory.createCategoryItem
);

router.post(
  '/edit-Category/:id_danh_muc',
  upload.single('hinh_anh'),  // Xử lý ảnh tải lên
  validate.editCategory,  // Validate dữ liệu đầu vào
  controllerCategory.update  // Cập nhật danh mục
);

module.exports = router;
