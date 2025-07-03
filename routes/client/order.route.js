const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');
const verifyToken = require('../../middleware/user.middleware');

router.use(verifyToken); // ✅ Bắt buộc người dùng phải đăng nhập

// ✅ Đặt hàng
router.post('/checkout', orderController.checkout);

// ✅ Lấy lịch sử đơn hàng của người dùng
router.get('/my', orderController.getByUser);

// ✅ Huỷ đơn hàng theo ID
router.put('/:id/cancel', orderController.cancelOrder);

// ✅ Lấy chi tiết đơn hàng theo ID
router.get('/:id', orderController.getDetailById);

module.exports = router;
