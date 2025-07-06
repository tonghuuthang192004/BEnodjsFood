const db = require('../../config/database');

const VoucherModel = {
  // 🎯 Lấy tất cả voucher đang hoạt động (giờ VN)
  async getAllActiveVouchers() {
    const sql = `
      SELECT id_giam_gia, ma_giam_gia, ten, loai, gia_tri, ngay_bat_dau, ngay_ket_thuc, so_luong_con_lai
      FROM giam_gia
      WHERE deleted = 0
        AND CAST(trang_thai AS CHAR) = 'active'
        AND so_luong_con_lai > 0
        AND ngay_bat_dau <= CONVERT_TZ(NOW(), '+00:00', '+07:00')
        AND ngay_ket_thuc >= CONVERT_TZ(NOW(), '+00:00', '+07:00')
      ORDER BY ngay_ket_thuc ASC
    `;
    console.log("🔍 [getAllActiveVouchers] SQL Query:\n", sql);
    const [rows] = await db.execute(sql);
    return rows;
  },

  // 🎯 Lấy voucher theo ID
  async getVoucherById(id_giam_gia) {
    const sql = `
      SELECT id_giam_gia, ten, loai, gia_tri, ngay_bat_dau, ngay_ket_thuc
      FROM giam_gia
      WHERE id_giam_gia = ?
        AND deleted = 0
        AND CAST(trang_thai AS CHAR) = 'active'
        AND so_luong_con_lai > 0
        AND ngay_bat_dau <= CONVERT_TZ(NOW(), '+00:00', '+07:00')
        AND ngay_ket_thuc >= CONVERT_TZ(NOW(), '+00:00', '+07:00')
    `;
    console.log("🔍 [getVoucherById] SQL Query:\n", sql);
    const [rows] = await db.execute(sql, [id_giam_gia]);
    return rows[0] || null;
  },

  // 🎯 Lấy voucher theo mã giảm giá
  async getVoucherByCode(ma_giam_gia) {
    const sql = `
      SELECT id_giam_gia, ma_giam_gia, ten, loai, gia_tri, dieu_kien,
             ngay_bat_dau, ngay_ket_thuc, so_luong_con_lai
      FROM giam_gia
      WHERE ma_giam_gia = ?
        AND deleted = 0
        AND CAST(trang_thai AS CHAR) = 'active'
        AND so_luong_con_lai > 0
        AND ngay_bat_dau <= CONVERT_TZ(NOW(), '+00:00', '+07:00')
        AND ngay_ket_thuc >= CONVERT_TZ(NOW(), '+00:00', '+07:00')
      LIMIT 1
    `;
    console.log("🔍 [getVoucherByCode] SQL Query:\n", sql, ma_giam_gia);
    const [rows] = await db.execute(sql, [ma_giam_gia]);
    return rows[0] || null;
  },

  // 🎯 Lưu voucher
  async saveVoucherForUser(id_nguoi_dung, id_giam_gia) {
    const [check] = await db.execute(
      `SELECT COUNT(*) AS count FROM giam_gia_da_luu WHERE id_nguoi_dung = ? AND id_giam_gia = ?`,
      [id_nguoi_dung, id_giam_gia]
    );
    if (check[0].count > 0) {
      console.log("⚠️ [saveVoucherForUser] Voucher đã tồn tại với user:", id_nguoi_dung);
      return { existed: true };
    }
    const [result] = await db.execute(
      `INSERT INTO giam_gia_da_luu (id_nguoi_dung, id_giam_gia, ngay_luu)
       VALUES (?, ?, CONVERT_TZ(NOW(), '+00:00', '+07:00'))`,
      [id_nguoi_dung, id_giam_gia]
    );
    return { existed: false, result };
  },

  // 🎯 Lấy danh sách voucher đã lưu của user
  async getSavedVouchersByUser(id_nguoi_dung) {
    const sql = `
      SELECT g.id_giam_gia, g.ma_giam_gia, g.ten, g.loai, g.gia_tri, g.ngay_bat_dau, g.ngay_ket_thuc
      FROM giam_gia_da_luu l
      JOIN giam_gia g ON l.id_giam_gia = g.id_giam_gia
      WHERE l.id_nguoi_dung = ?
        AND g.deleted = 0
        AND CAST(g.trang_thai AS CHAR) = 'active'
        AND g.so_luong_con_lai > 0
        AND g.ngay_bat_dau <= CONVERT_TZ(NOW(), '+00:00', '+07:00')
        AND g.ngay_ket_thuc >= CONVERT_TZ(NOW(), '+00:00', '+07:00')
      ORDER BY g.ngay_ket_thuc ASC
    `;
    console.log("🔍 [getSavedVouchersByUser] SQL Query:\n", sql);
    const [rows] = await db.execute(sql, [id_nguoi_dung]);
    return rows;
  }
};

module.exports = VoucherModel;
