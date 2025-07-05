const db = require('../../config/database');

exports.getAddresses = async (userId) => {
  const [rows] = await db.execute(
    'SELECT * FROM dia_chi WHERE id_nguoi_dung = ?',
    [userId]
  );
  return rows;
};

exports.addAddress = async (data) => {
  const { id_nguoi_dung, ten_nguoi_dung, so_dien_thoai, dia_chi_day_du } = data;
  await db.execute(
    `INSERT INTO dia_chi (id_nguoi_dung, ten_nguoi_dung, so_dien_thoai, dia_chi_day_du, mac_dinh)
     VALUES (?, ?, ?, ?, 0)`,
    [id_nguoi_dung, ten_nguoi_dung, so_dien_thoai, dia_chi_day_du]
  );
};

exports.updateAddress = async (id, data) => {
  const { ten_nguoi_dung, so_dien_thoai, dia_chi_day_du } = data;
  await db.execute(
    `UPDATE dia_chi
     SET ten_nguoi_dung = ?, so_dien_thoai = ?, dia_chi_day_du = ?
     WHERE id = ?`,
    [ten_nguoi_dung, so_dien_thoai, dia_chi_day_du, id]
  );
};

exports.deleteAddress = async (id) => {
  await db.execute('DELETE FROM dia_chi WHERE id = ?', [id]);
};

exports.setDefaultAddress = async (userId, addressId) => {
  // Reset all addresses to mac_dinh = 0
  await db.execute(
    'UPDATE dia_chi SET mac_dinh = 0 WHERE id_nguoi_dung = ?',
    [userId]
  );
  // Set selected address to mac_dinh = 1
  await db.execute(
    'UPDATE dia_chi SET mac_dinh = 1 WHERE id = ? AND id_nguoi_dung = ?',
    [addressId, userId]
  );
};
