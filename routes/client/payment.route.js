const express = require('express');
const router = express.Router();

const paymentController = require('../../controllers/client/payment.controller');
const { authenticate } = require('../../helper/middleware');

/// 🛒 Đặt hàng COD
router.post('/:id/orders', authenticate, paymentController.payOrderCODController);

/// 📥 MoMo callback (IPN từ MoMo gửi về)
router.post('/momo/callback', paymentController.callback);

/// 🔄 Kiểm tra trạng thái thanh toán
router.post('/status-payment', authenticate, paymentController.statusPayment);

/// ✅ Xác nhận COD
router.post('/confirm-cod', authenticate, paymentController.confirmCod);

// /// 📦 Tạo thanh toán MoMo (Flutter gọi để lấy payUrl)
// router.post('/momo/create', authenticate, paymentController.createPaymentMomo);

module.exports = router;
