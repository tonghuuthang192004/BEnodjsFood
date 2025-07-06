const db = require('../../config/database');

// 📦 Lấy giỏ hàng của user
const getCartUserID = async (userId) => {
  const [result] = await db.query(
    'SELECT * FROM gio_hang WHERE id_nguoi_dung = ? ORDER BY ngay_tao DESC LIMIT 1',
    [userId]
  );
  return result.length > 0 ? result[0] : null;
};

// 🆕 Tạo giỏ hàng mới
const createCart = async (userId) => {
  const sql = 'INSERT INTO gio_hang (id_nguoi_dung, ngay_tao) VALUES (?, NOW())';
  const [result] = await db.query(sql, [userId]);
  const [cart] = await db.query('SELECT * FROM gio_hang WHERE id_gio_hang = ?', [result.insertId]);
  return cart[0];
};

// 📥 Lấy danh sách sản phẩm trong giỏ (bỏ qua sản phẩm đã xóa)
const getCartItem = async (cartId) => {
  const sql = `
    SELECT 
      gio_hang_chi_tiet.id, 
      gio_hang_chi_tiet.id_san_pham, 
      gio_hang_chi_tiet.so_luong, 
      san_pham.ten, 
      san_pham.gia, 
      san_pham.hinh_anh
    FROM gio_hang_chi_tiet
    JOIN san_pham ON gio_hang_chi_tiet.id_san_pham = san_pham.id_san_pham
    WHERE gio_hang_chi_tiet.id_gio_hang = ? AND gio_hang_chi_tiet.deleted = 0`;
  const [result] = await db.query(sql, [cartId]);
  return result;
};

// ➕ Thêm sản phẩm vào giỏ (khôi phục nếu deleted=1)
const addItemToCart = async (cartId, productId, quantity) => {
  // Kiểm tra nếu sản phẩm đã tồn tại
  const [existing] = await db.query(
    'SELECT * FROM gio_hang_chi_tiet WHERE id_gio_hang = ? AND id_san_pham = ?',
    [cartId, productId]
  );

  if (existing.length > 0) {
    if (existing[0].deleted === 1) {
      // 🟢 Khôi phục sản phẩm nếu đã bị xóa
      const newQuantity = quantity; // Không cộng dồn, vì user thêm lại
      const [restoreResult] = await db.query(
        'UPDATE gio_hang_chi_tiet SET so_luong = ?, deleted = 0 WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      return { type: 'restore', result: restoreResult, quantity: newQuantity };
    } else {
      // 🔄 Cộng dồn số lượng nếu chưa bị xóa
      const newQuantity = existing[0].so_luong + quantity;
      const [updateResult] = await db.query(
        'UPDATE gio_hang_chi_tiet SET so_luong = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      return { type: 'update', result: updateResult, quantity: newQuantity };
    }
  } else {
    // ➕ Thêm sản phẩm mới
    const [insertResult] = await db.query(
      'INSERT INTO gio_hang_chi_tiet (id_gio_hang, id_san_pham, so_luong) VALUES (?, ?, ?)',
      [cartId, productId, quantity]
    );
    return { type: 'insert', result: insertResult, quantity };
  }
};

// 🔄 Cập nhật số lượng sản phẩm
const updateCartItemQuantity = async (cartId, productId, quantity) => {
  const sql = `
    UPDATE gio_hang_chi_tiet 
    SET so_luong = ? 
    WHERE id_gio_hang = ? AND id_san_pham = ? AND deleted = 0`;
  const [result] = await db.query(sql, [quantity, cartId, productId]);

  if (result.affectedRows === 0) {
    // Nếu sản phẩm chưa tồn tại hoặc bị xóa => Thêm mới hoặc khôi phục
    return await addItemToCart(cartId, productId, quantity);
  }
  return result;
};

// ❌ Xoá 1 sản phẩm (update deleted=1)
const deleteItem = async (cartId, productId) => {
  const sql = `
    UPDATE gio_hang_chi_tiet 
    SET deleted = 1 
    WHERE id_gio_hang = ? AND id_san_pham = ?`;
  const [result] = await db.query(sql, [cartId, productId]);
  return result;
};

// 🧹 Xoá toàn bộ giỏ (update deleted=1)
const clearCart = async (cartId) => {
  const sql = `
    UPDATE gio_hang_chi_tiet 
    SET deleted = 1 
    WHERE id_gio_hang = ?`;
  const [result] = await db.query(sql, [cartId]);
  return result;
};

// ♻️ Khôi phục 1 sản phẩm đã xoá
const restoreCartItem = async (cartId, productId, quantity = 1) => {
  const sql = `
    UPDATE gio_hang_chi_tiet 
    SET deleted = 0, so_luong = ? 
    WHERE id_gio_hang = ? AND id_san_pham = ?`;
  const [result] = await db.query(sql, [quantity, cartId, productId]);
  return result;
};

module.exports = {
  getCartUserID,
  createCart,
  getCartItem,
  addItemToCart,
  updateCartItemQuantity,
  deleteItem,
  clearCart,
  restoreCartItem, // 🆕 thêm hàm khôi phục
};
