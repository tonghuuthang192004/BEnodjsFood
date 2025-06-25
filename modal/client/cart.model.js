// modal/client/cart.model.js

const db = require('../../config/database');

const getCartUserID = async (userId) => {
  const [result] = await db.query('SELECT * FROM gio_hang WHERE id_nguoi_dung = ? ORDER BY ngay_tao DESC LIMIT 1', [userId]);
  return result.length > 0 ? result[0] : null;
};

const createCart = async (userId) => {
  const sql = 'INSERT INTO gio_hang (id_nguoi_dung, ngay_tao) VALUES (?, NOW())';
  const [result] = await db.query(sql, [userId]);
  return result;
};

const getCartItem = async (cartId) => {
  const sql = `SELECT gio_hang_chi_tiet.id, gio_hang_chi_tiet.so_luong, san_pham.ten, san_pham.gia, san_pham.hinh_anh
               FROM gio_hang_chi_tiet
               JOIN san_pham ON gio_hang_chi_tiet.id_san_pham = san_pham.id_san_pham
               WHERE gio_hang_chi_tiet.id_gio_hang = ?`;

  const [result] = await db.query(sql, [cartId]);
  return result;
};

const updateCartItemQuantity = async (itemId, quantity, userId) => {
  const sql = 'UPDATE gio_hang_chi_tiet SET so_luong = ? WHERE id = ? AND id_gio_hang IN (SELECT id_gio_hang FROM gio_hang WHERE id_nguoi_dung = ?)';
  const [result] = await db.query(sql, [quantity, itemId, userId]);
  return result;
};

const deleteItem = async (cartId, productId) => {
  const sql = 'DELETE FROM gio_hang_chi_tiet WHERE id_gio_hang = ? AND id_san_pham = ?';
  const [result] = await db.query(sql, [cartId, productId]);
  return result;
};

module.exports = {
  getCartUserID,
  createCart,
  getCartItem,
  updateCartItemQuantity,
  deleteItem,
};
