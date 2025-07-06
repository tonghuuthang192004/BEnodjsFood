const db = require('../../config/database');

const confirmCodPayment = async (orderId, userId) => {
  // Cập nhật trạng thái đơn hàng thành Đã thanh toán (COD)
  const [result] = await db.query(
    `UPDATE don_hang 
     SET trang_thai = 'Đang xử lý', 
         trang_thai_thanh_toan = 'Chưa thanh toán', 
         phuong_thuc_thanh_toan = 'COD' 
     WHERE id_don_hang = ? AND id_nguoi_dung = ?`,
    [orderId, userId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  confirmCodPayment,
};
