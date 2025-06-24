const express = require('express');
const router = express.Router();
const controllerUser = require('../../controllers/admin/user.controller');

// validate có thể thêm lại nếu cần
// const validate = require('../../validate/User.validate');

const multer = require('multer');
const storgaMulter = require('../../helper/storge');
const upload = multer({ storage: storgaMulter() });

// ======================= ROUTES NGƯỜI DÙNG =======================

// Danh sách người dùng
router.get('/', controllerUser.index);

// Đổi trạng thái 1 người dùng (active <-> inactive)
router.put('/change-status/:status/:id', controllerUser.changeStatus);

// Đổi trạng thái nhiều người dùng
router.put('/change-multi', controllerUser.changeMulti);

// Xóa mềm 1 người dùng
router.delete('/deleted/:id', controllerUser.deleteId);

// Xóa mềm nhiều người dùng
router.delete('/delete-multiple', controllerUser.deleteMultiple);

// Tạo mới người dùng
router.post(
  '/create-user',
  upload.single('avatar'), // avatar là ảnh đại diện
  // validate.createUser, // nếu có validate
  controllerUser.createUser
);

// Lấy thông tin 1 người dùng để sửa
router.get('/edit-user/:id_nguoi_dung', controllerUser.getEditUser);

// Cập nhật người dùng
router.post(
  '/edit-user/:id_nguoi_dung',
  upload.single('avatar'),
  // validate.editUser, // nếu có validate
  controllerUser.editUser
);

// Chi tiết người dùng
router.get('/user-detail/:id_nguoi_dung', controllerUser.getEditUser); // hoặc dùng controllerUser.userDetail nếu bạn có

// ================================================================

module.exports = router;
