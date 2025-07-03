const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/client/address.controller');

// 📥 Lấy danh sách địa chỉ của user
router.get('/:userId', addressController.getAllAddresses);

// ➕ Thêm địa chỉ mới
router.post('/', addressController.addAddress);

// ✏️ Cập nhật địa chỉ
router.put('/:id', addressController.updateAddress);

// 🗑️ Xoá địa chỉ
router.delete('/:id', addressController.deleteAddress);

// 🌟 Đặt địa chỉ mặc định
router.patch('/default/:id', addressController.setDefaultAddress);

module.exports = router;
