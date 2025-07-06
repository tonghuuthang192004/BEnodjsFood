const db = require('../../config/database');

// 📥 Lấy tất cả sản phẩm yêu thích của user (deleted = 0)
exports.getFavoritesByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT sp.* 
     FROM san_pham_yeu_thich sy
     JOIN san_pham sp ON sp.id_san_pham = sy.id_san_pham
     WHERE sy.id_nguoi_dung = ? AND sy.deleted = 0`,
    [userId]
  );
  return rows;
};

// 🔍 Kiểm tra trạng thái yêu thích: true / false / 'deleted'
exports.isFavorite = async (userId, productId) => {
  const [rows] = await db.execute(
    `SELECT deleted FROM san_pham_yeu_thich
     WHERE id_nguoi_dung = ? AND id_san_pham = ? LIMIT 1`,
    [userId, productId]
  );
  if (rows.length === 0) return false;
  return rows[0].deleted === 0 ? true : 'deleted';
};

// ➕ Thêm sản phẩm vào yêu thích
exports.addFavorite = async (userId, productId) => {
  const [result] = await db.execute(
    `INSERT INTO san_pham_yeu_thich (id_nguoi_dung, id_san_pham, ngay_tao)
     VALUES (?, ?, NOW())`,
    [userId, productId]
  );
  return result.affectedRows > 0;
};

// 🔄 Khôi phục sản phẩm bị xoá (set deleted = 0)
exports.restoreFavorite = async (userId, productId) => {
  const [result] = await db.execute(
    `UPDATE san_pham_yeu_thich
     SET deleted = 0, ngay_tao = NOW()
     WHERE id_nguoi_dung = ? AND id_san_pham = ? AND deleted = 1`,
    [userId, productId]
  );
  return result.affectedRows > 0;
};

// ❌ Xoá 1 sản phẩm yêu thích (set deleted = 1)
exports.deleteFavorite = async (productId, userId) => {
  const [result] = await db.execute(
    `UPDATE san_pham_yeu_thich
     SET deleted = 1
     WHERE id_nguoi_dung = ? AND id_san_pham = ? AND deleted = 0`,
    [userId, productId]
  );
  return result.affectedRows > 0;
};

// 🗑️ Xoá tất cả sản phẩm yêu thích của user
exports.clearFavoritesByUser = async (userId) => {
  const [result] = await db.execute(
    `UPDATE san_pham_yeu_thich
     SET deleted = 1
     WHERE id_nguoi_dung = ? AND deleted = 0`,
    [userId]
  );
  return result.affectedRows > 0;
};
