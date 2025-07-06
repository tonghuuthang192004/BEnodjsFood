const express = require('express');
const router = express.Router();
const voucherController = require('../../controllers/client/voucher.controller');

// 📌 1️⃣ Lấy danh sách voucher đang hoạt động
router.get('/', voucherController.getActiveVouchers);

// 📌 2️⃣ Lưu voucher
router.post('/save', voucherController.saveVoucher);

// 📌 3️⃣ Lấy danh sách voucher đã lưu
router.get('/saved/:userId', voucherController.getSavedVouchers);

// 📌 4️⃣ Sử dụng voucher
router.post('/use', voucherController.useVoucher);

module.exports = router;
