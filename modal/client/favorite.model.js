const db = require('../../config/database');

// ✅ Lấy tất cả sản phẩm yêu thích của user
exports.getFavoritesByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT sp.* FROM san_pham_yeu_thich sy
     JOIN san_pham sp ON sp.id_san_pham = sy.id_san_pham
     WHERE sy.id_nguoi_dung = ?`,
    [userId]
  );
  return rows;
};

// 🔥 Check sản phẩm đã tồn tại trong yêu thích
exports.isFavorite = async (userId, productId) => {
  const [rows] = await db.execute(
    `SELECT 1 FROM san_pham_yeu_thich
     WHERE id_nguoi_dung = ? AND id_san_pham = ? LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
};

// ✅ Thêm sản phẩm vào yêu thích
exports.addFavorite = async (userId, productId) => {
  const [result] = await db.execute(
    `INSERT INTO san_pham_yeu_thich (id_nguoi_dung, id_san_pham, ngay_tao)
     VALUES (?, ?, NOW())`,
    [userId, productId]
  );
  return result;
};

// ✅ Xoá 1 sản phẩm yêu thích
exports.deleteFavorite = async (productId, userId) => {
  const [result] = await db.execute(
    `DELETE FROM san_pham_yeu_thich
     WHERE id_san_pham = ? AND id_nguoi_dung = ?`,
    [productId, userId]
  );
  return result;
};

// 🗑️ Xoá tất cả sản phẩm yêu thích của user
exports.clearFavoritesByUser = async (userId) => {
  const [result] = await db.execute(
    `DELETE FROM san_pham_yeu_thich WHERE id_nguoi_dung = ?`,
    [userId]
  );
  return result;
};
