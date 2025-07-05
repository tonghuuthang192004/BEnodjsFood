const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/client/address.controller');
const { authenticate } = require('../../helper/middleware');

// 📥 Lấy danh sách địa chỉ
router.get('/', authenticate, addressController.getAllAddresses);

// ➕ Thêm địa chỉ
router.post('/', authenticate, addressController.addAddress);

// ✏️ Cập nhật địa chỉ
router.put('/:id', authenticate, addressController.updateAddress);

// 🗑️ Xoá địa chỉ
router.delete('/:id', authenticate, addressController.deleteAddress);

// ✅ Đặt địa chỉ mặc định
router.patch('/default/:id', authenticate, addressController.setDefaultAddress);

module.exports = router;
