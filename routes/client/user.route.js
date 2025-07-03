const express = require('express');
const router = express.Router();
const userController = require('../../controllers/client/user.controller');
const { authenticate } = require('../../helper/middleware');

// Đăng ký
router.post('/dang-ky', userController.register);

// Xác minh email
router.get('/xac-minh-email', userController.verifyEmail);

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

module.exports = router;
