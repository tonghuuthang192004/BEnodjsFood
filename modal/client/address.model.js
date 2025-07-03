const db = require('../../config/database');

// 📥 Lấy tất cả địa chỉ của user
exports.getAllAddresses = async (userId) => {
  const [rows] = await db.execute(
    `SELECT * FROM dia_chi WHERE id_nguoi_dung = ? ORDER BY id DESC`,
    [userId]
  );
  return rows;
};

// ➕ Thêm địa chỉ mới
exports.addAddress = async (data) => {
  const { id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh } = data;

  if (mac_dinh === 1) {
    // Bỏ mặc định các địa chỉ khác
    await db.execute(
      `UPDATE dia_chi SET mac_dinh = 0 WHERE id_nguoi_dung = ?`,
      [id_nguoi_dung]
    );
  }

  const [result] = await db.execute(
    `INSERT INTO dia_chi (id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh)
     VALUES (?, ?, ?, ?, ?)`,
    [id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh]
  );
  return result;
};

// ✏️ Cập nhật địa chỉ
exports.updateAddress = async (id, data) => {
  const { id_nguoi_dung, ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh } = data;

  if (mac_dinh === 1) {
    await db.execute(
      `UPDATE dia_chi SET mac_dinh = 0 WHERE id_nguoi_dung = ?`,
      [id_nguoi_dung]
    );
  }

  const [result] = await db.execute(
    `UPDATE dia_chi
     SET ten_nguoi_nhan = ?, so_dien_thoai = ?, dia_chi_day_du = ?, mac_dinh = ?
     WHERE id = ? AND id_nguoi_dung = ?`,
    [ten_nguoi_nhan, so_dien_thoai, dia_chi_day_du, mac_dinh, id, id_nguoi_dung]
  );
  return result;
};

// 🗑️ Xoá địa chỉ
exports.deleteAddress = async (id) => {
  const [result] = await db.execute(
    `DELETE FROM dia_chi WHERE id = ?`,
    [id]
  );
  return result;
};

// 🌟 Đặt địa chỉ mặc định
exports.setDefaultAddress = async (id, id_nguoi_dung) => {
  // Bỏ mặc định các địa chỉ khác
  await db.execute(
    `UPDATE dia_chi SET mac_dinh = 0 WHERE id_nguoi_dung = ?`,
    [id_nguoi_dung]
  );

  // Set địa chỉ mới làm mặc định
  const [result] = await db.execute(
    `UPDATE dia_chi SET mac_dinh = 1 WHERE id = ? AND id_nguoi_dung = ?`,
    [id, id_nguoi_dung]
  );

  if (result.affectedRows === 0) {
    throw new Error('Địa chỉ không tồn tại hoặc không thuộc người dùng');
  }

  return result;
};
