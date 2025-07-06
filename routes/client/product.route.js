const express = require('express');
const router = express.Router();
const productController = require('../../controllers/client/product.controller');

// 🟢 Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);

// 🔥 Lấy danh sách sản phẩm HOT
router.get('/hot', productController.getHotProducts);

// 📦 Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

// 🛍️ Lấy sản phẩm theo ID danh mục
router.get('/category/:id', productController.getProductsByCategory);

// Lấy sản phẩm liên quan theo danh mục
router.get('/category/:categoryId/related/:productId', productController.getRelatedProducts);
module.exports = router;
