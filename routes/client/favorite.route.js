const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/client/favorite.controller');

// 📦 Lấy danh sách sản phẩm yêu thích
router.get('/:userId', favoriteController.getFavorites);

// ➕ Thêm sản phẩm vào yêu thích
router.post('/', favoriteController.addFavorite);

// ❌ Xoá 1 sản phẩm yêu thích
router.delete('/:id_san_pham/:userId', favoriteController.deleteFavorite);

// 🗑️ Xoá toàn bộ sản phẩm yêu thích
router.delete('/user/:userId', favoriteController.clearFavorites);

module.exports = router;
