const favoriteModel = require('../../modal/client/favorite.model');

// 📥 Lấy danh sách sản phẩm yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const favorites = await favoriteModel.getFavoritesByUser(userId);
    res.status(200).json({ success: true, data: favorites });
  } catch (err) {
    console.error('❌ [getFavorites] Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách yêu thích' });
  }
};

// ➕ Thêm sản phẩm vào yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const status = await favoriteModel.isFavorite(userId, productId);
    if (status === true) {
      return res.status(200).json({ success: true, message: 'Sản phẩm đã có trong danh sách yêu thích' });
    } else if (status === 'deleted') {
      const restored = await favoriteModel.restoreFavorite(userId, productId);
      if (restored) {
        return res.status(200).json({ success: true, message: 'Đã khôi phục sản phẩm vào yêu thích' });
      } else {
        throw new Error('Không thể khôi phục sản phẩm yêu thích');
      }
    }

    const added = await favoriteModel.addFavorite(userId, productId);
    if (added) {
      res.status(201).json({ success: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích' });
    } else {
      throw new Error('Thêm yêu thích thất bại');
    }
  } catch (err) {
    console.error('❌ [addFavorite] Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi thêm sản phẩm yêu thích' });
  }
};

// ❌ Xoá 1 sản phẩm yêu thích
exports.deleteFavorite = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const deleted = await favoriteModel.deleteFavorite(productId, userId);
    res.status(200).json({
      success: true,
      message: deleted
        ? 'Đã xoá sản phẩm khỏi danh sách yêu thích'
        : 'Sản phẩm yêu thích không tồn tại hoặc đã xoá'
    });
  } catch (err) {
    console.error('❌ [deleteFavorite] Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá sản phẩm yêu thích' });
  }
};

// 🗑️ Xoá toàn bộ sản phẩm yêu thích
exports.clearFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cleared = await favoriteModel.clearFavoritesByUser(userId);
    res.status(200).json({
      success: true,
      message: cleared ? 'Đã xoá toàn bộ yêu thích' : 'Danh sách yêu thích đã trống'
    });
  } catch (err) {
    console.error('❌ [clearFavorites] Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi xoá toàn bộ yêu thích' });
  }
};

// 🔍 Kiểm tra trạng thái yêu thích
exports.isFavorite = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const status = await favoriteModel.isFavorite(userId, productId);
    res.status(200).json({ success: true, data: status });
  } catch (err) {
    console.error('❌ [isFavorite] Error:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra trạng thái yêu thích' });
  }
};
