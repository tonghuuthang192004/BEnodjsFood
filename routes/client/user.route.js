const express = require('express');
const router = express.Router();
const userController = require('../../controllers/client/user.controller');
const { authenticate } = require('../../helper/middleware');
const uploadAvatar = require('../../helper/uploadAvatar');
// Đăng ký
router.post('/dang-ky', userController.register);

// Xác minh email
router.post('/xac-minh-email', userController.verifyEmail);

// Đăng nhập
router.post('/dang-nhap', userController.login);

// Cập nhật thông tin
router.put('/cap-nhat', authenticate, userController.updateProfile);

// Đổi mật khẩu
router.put('/doi-mat-khau', authenticate, userController.changePassword);

// Quên mật khẩu
router.post('/quen-mat-khau', userController.forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-mat-khau', userController.resetPassword);

// Lấy thông tin user hiện tại
router.get('/me', authenticate, userController.getCurrentUser);

router.post('/upload-avatar', authenticate, uploadAvatar.single('avatar'), userController.uploadAvatar);

module.exports = router;
