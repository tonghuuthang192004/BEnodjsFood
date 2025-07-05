const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/client/favorite.controller');

// 📥 Lấy danh sách yêu thích
router.get('/:userId', favoriteController.getFavorites);

// ➕ Thêm sản phẩm vào yêu thích
router.post('/', favoriteController.addFavorite);

// ❌ Xoá 1 sản phẩm yêu thích
router.delete('/:productId/:userId', favoriteController.deleteFavorite);

// 🗑️ Xoá toàn bộ yêu thích
router.delete('/user/:userId', favoriteController.clearFavorites);

// 🔍 Kiểm tra trạng thái yêu thích
router.get('/is-favorite/:productId/:userId', favoriteController.isFavorite);

module.exports = router;
