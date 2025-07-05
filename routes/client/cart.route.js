const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller');
const { authenticate } = require('../../helper/middleware');

// 📦 Lấy giỏ hàng
router.get('/', authenticate, cartController.getUserCart);

// ➕ Thêm sản phẩm vào giỏ
router.post('/item', authenticate, cartController.addItemToCart);

// 🔄 Cập nhật số lượng sản phẩm
router.put('/item/:id_san_pham', authenticate, cartController.updateItemQuantity);

// ❌ Xoá 1 sản phẩm (soft-delete)
router.delete('/item/:id_san_pham', authenticate, cartController.deleteItem);

// 🧹 Xoá toàn bộ giỏ hàng (soft-delete)
router.delete('/clear', authenticate, cartController.clearCart);

// ♻️ Khôi phục sản phẩm
router.patch('/item/:id_san_pham/restore', authenticate, cartController.restoreItem);


module.exports = router;
