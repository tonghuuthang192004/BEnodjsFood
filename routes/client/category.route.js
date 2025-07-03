const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/client/category.controller');

// 🟢 API lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);

// 🟢 API lấy sản phẩm theo ID danh mục
router.get('/:id/products', categoryController.getProductsByCategory);

module.exports = router;
