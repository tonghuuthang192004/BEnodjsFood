// orderModel.js
const db = require('../../config/database');

module.exports = {
  findOrderByMomoOrderId: async (momoOrderId) => {
    const [orders] = await db.query(
      'SELECT * FROM don_hang WHERE momo_order_id = ?',
      [momoOrderId]
    );
    return orders;
  },

  findPaymentByOrderIdAndMethod: async (idDonHang, method) => {
    const [payments] = await db.query(
      'SELECT * FROM thanh_toan WHERE id_don_hang = ? AND phuong_thuc = ?',
      [idDonHang, method]
    );
    return payments;
  },

  insertPayment: async (idDonHang, amount) => {
    await db.query(
      `INSERT INTO thanh_toan 
      (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan)
      VALUES (?, ?, 'MoMo', 'Đã thanh toán', NOW())`,
      [idDonHang, amount]
    );
  },

  updatePayment: async (idDonHang) => {
    await db.query(
      `UPDATE thanh_toan 
      SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW()
      WHERE id_don_hang = ? AND phuong_thuc = 'MoMo'`,
      [idDonHang]
    );
  },

  updateOrderStatus: async (idDonHang) => {
    await db.query(
      `UPDATE don_hang 
      SET trang_thai = ?, trang_thai_thanh_toan = ?, phuong_thuc_thanh_toan = ?
      WHERE id_don_hang = ?`,
      ['Đã giao', 'Đã thanh toán', 'MoMo', idDonHang]
    );
  },

  insertOrderHistory: async (idDonHang) => {
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), ?, ?)`,
      [idDonHang, 'Đã giao', 'Thanh toán MoMo thành công']
    );
  }
};
