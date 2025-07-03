// routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller');
const { authenticate } = require('../../helper/middleware'); // ✅ dùng destructuring nếu export nhiều hàm

// 📦 API Giỏ hàng
router.get('/', authenticate, cartController.getUserCart); // Lấy giỏ hàng
router.post('/create', authenticate, cartController.createCart); // Tạo giỏ hàng mới
router.get('/items', authenticate, cartController.getCartItems); // Lấy sản phẩm trong giỏ
router.put('/item', authenticate, cartController.updateItemQuantity); // Cập nhật số lượng sản phẩm
router.delete('/item', authenticate, cartController.deleteItem); // Xoá 1 sản phẩm khỏi giỏ

// // 🗑 API clear toàn bộ giỏ hàng
// router.delete('/clear', authenticate, cartController.clearCart);

module.exports = router;
