const db = require('../../config/database');

const VoucherModel = {
  // 🎯 Lấy tất cả voucher đang hoạt động
  async getAllActiveVouchers() {
    const [rows] = await db.execute(
      `SELECT * FROM giam_gia
       WHERE deleted = 0
         AND trang_thai = 1
         AND so_luong_con_lai > 0
         AND ngay_bat_dau <= NOW()
         AND ngay_ket_thuc >= NOW()
       ORDER BY ngay_ket_thuc ASC`
    );
    return rows;
  },

  // 🎯 Lấy voucher theo ID
  async getVoucherById(id_giam_gia) {
    const [rows] = await db.execute(
      `SELECT * FROM giam_gia
       WHERE id_giam_gia = ?
         AND deleted = 0
         AND trang_thai = 1
         AND ngay_bat_dau <= NOW()
         AND ngay_ket_thuc >= NOW()`,
      [id_giam_gia]
    );
    return rows;
  },

  // 🎯 Lấy voucher theo mã
  async getVoucherByCode(ma_giam_gia) {
    const [rows] = await db.execute(
      `SELECT * FROM giam_gia
       WHERE ma_giam_gia = ?
         AND deleted = 0
         AND trang_thai = 1
         AND ngay_bat_dau <= NOW()
         AND ngay_ket_thuc >= NOW()`,
      [ma_giam_gia]
    );
    return rows;
  },

  // 🎯 Giảm số lượng còn lại (sử dụng voucher)
  async decrementVoucherQuantity(id_giam_gia) {
    const [result] = await db.execute(
      `UPDATE giam_gia
       SET so_luong_con_lai = so_luong_con_lai - 1
       WHERE id_giam_gia = ? AND so_luong_con_lai > 0`,
      [id_giam_gia]
    );
    return result;
  },

  // 🎯 Lưu voucher vào ví người dùng
  async saveVoucherForUser(id_nguoi_dung, id_giam_gia) {
    const [result] = await db.execute(
      `INSERT INTO khuyen_mai_da_luu (id_nguoi_dung, id_giam_gia, ngay_luu)
       VALUES (?, ?, NOW())`,
      [id_nguoi_dung, id_giam_gia]
    );
    return result;
  },

  // 🎯 Check user đã lưu voucher chưa
  async isVoucherSavedByUser(id_nguoi_dung, id_giam_gia) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count FROM khuyen_mai_da_luu
       WHERE id_nguoi_dung = ? AND id_giam_gia = ?`,
      [id_nguoi_dung, id_giam_gia]
    );
    return rows[0].count > 0;
  },

  // 🎯 Lấy danh sách voucher đã lưu của user
  async getSavedVouchersByUser(id_nguoi_dung) {
    const [rows] = await db.execute(
      `SELECT g.* FROM giam_gia g
       JOIN khuyen_mai_da_luu k ON g.id_giam_gia = k.id_giam_gia
       WHERE k.id_nguoi_dung = ? AND g.deleted = 0`,
      [id_nguoi_dung]
    );
    return rows;
  }
};

module.exports = VoucherModel;
