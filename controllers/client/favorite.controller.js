const favoriteModel = require('../../modal/client/favorite.model');

// ✅ Lấy danh sách yêu thích
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    const favorites = await favoriteModel.getFavoritesByUser(userId);

    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('❌ [getFavorites] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách yêu thích'
    });
  }
};

// ✅ Thêm sản phẩm vào yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    await favoriteModel.addFavorite(userId, productId);

    res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm vào danh sách yêu thích'
    });
  } catch (error) {
    console.error('❌ [addFavorite] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm sản phẩm vào danh sách yêu thích'
    });
  }
};

// ✅ Xoá 1 sản phẩm yêu thích
exports.deleteFavorite = async (req, res) => {
  try {
    const { id_san_pham, userId } = req.params;
    const result = await favoriteModel.deleteFavorite(id_san_pham, userId);

    res.status(200).json({
      success: true,
      message: result.affectedRows > 0
        ? 'Đã xoá sản phẩm khỏi danh sách yêu thích'
        : 'Sản phẩm yêu thích không tồn tại hoặc đã bị xoá'
    });
  } catch (error) {
    console.error('❌ [deleteFavorite] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xoá sản phẩm yêu thích'
    });
  }
};

// ✅ Xoá tất cả sản phẩm yêu thích
// 🗑️ Xoá toàn bộ sản phẩm yêu thích
// 🗑️ Xoá toàn bộ sản phẩm yêu thích
exports.clearFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('🟡 [CONTROLLER] clearFavorites called with userId:', userId);

    const result = await favoriteModel.clearFavoritesByUser(userId);

    console.log('🟡 [CONTROLLER] clearFavorites result:', result);

    if (result.affectedRows > 0) {
      console.log('✅ [CONTROLLER] Deleted', result.affectedRows, 'rows');
      return res.status(200).json({
        success: true,
        message: 'Đã xoá toàn bộ sản phẩm yêu thích'
      });
    } else {
      console.log('⚠️ [CONTROLLER] No rows deleted');
      return res.status(200).json({
        success: true,
        message: 'Danh sách yêu thích đã trống'
      });
    }
  } catch (error) {
    console.error('❌ [clearFavorites] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xoá toàn bộ sản phẩm yêu thích'
    });
  }
};
