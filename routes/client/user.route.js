const express = require('express');
const router = express.Router();
const userController = require('../../controllers/client/user.controller');
const { authenticate } = require('../../helper/middleware');


// 📝 Đăng ký & xác minh
router.post('/dang-ky', userController.register);
router.post('/xac-minh-email', userController.verifyEmail);

// 🔓 Đăng nhập
router.post('/dang-nhap', userController.login);

// ✏️ Cập nhật thông tin
router.post('/cap-nhat', authenticate, userController.updateProfile);

// 🖼 Upload avatar

// 🔒 Đổi mật khẩu
router.post('/doi-mat-khau', authenticate, userController   .changePassword);

// 🔑 Quên mật khẩu & reset
router.post('/quen-mat-khau', userController.forgotPassword);
router.post('/xac-minh-otp', userController.verifyOtp);
router.post('/reset-mat-khau', userController.resetPassword);

// 📄 Lấy thông tin user hiện tại
router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router;
