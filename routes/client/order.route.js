const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');
const { authenticate } = require('../../helper/middleware');

// 📥 Lấy danh sách đơn hàng của user (có lọc trạng thái ?status)
router.get('/', authenticate, orderController.getOrdersByUser);

// 🔍 Lấy chi tiết 1 đơn hàng của user
router.get('/:id', authenticate, orderController.getOrderDetailByUser);

// 🛒 Tạo đơn hàng mới (COD hoặc MoMo)
router.post('/create', authenticate, orderController.createOrderAndPay);

// 🗑️ Huỷ đơn hàng (chỉ khi chưa xác nhận)
router.patch('/:id/cancel', authenticate, orderController.cancelOrderByUser);

// 🔄 Mua lại đơn hàng (copy sp vào giỏ hàng mới)
router.post('/:id/reorder', authenticate, orderController.reorder);

// ⭐ Đánh giá sản phẩm (chỉ sau khi đã giao & thanh toán)
router.post('/:id/review', authenticate, orderController.reviewProduct);

// 📩 Callback từ MoMo (không cần auth vì MoMo gọi)
router.post('/momo/callback', orderController.momoCallback);

module.exports = router;
