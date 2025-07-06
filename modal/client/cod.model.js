const db = require('../../config/database');
const { orderDetail } = require('../../modal/client/order.model');

const payOrderCOD = async (orderId) => {
  try {
    // 1. Kiểm tra đơn hàng tồn tại
    const [rows] = await db.query(
      'SELECT * FROM don_hang WHERE id_don_hang = ?',
      [orderId]
    );

    console.log('Kết quả truy vấn:', rows);
    console.log('orderId nhận được là:', orderId);

    if (rows.length === 0) throw new Error('Không tìm thấy đơn hàng');

    const order = rows[0];

    // Nếu đơn hàng đã thanh toán thì không cho đặt COD nữa
    if (order.trang_thai_thanh_toan === 'Đã thanh toán') {
      throw new Error('Đơn hàng đã được thanh toán');
    }

    // 2. Thêm bản ghi thanh toán với trạng thái "Chờ thanh toán"
    await db.query(
      `INSERT INTO thanh_toan (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan)
       VALUES (?, ?, 'COD', 'Chờ thanh toán', NOW())`,
      [orderId, order.tong_gia]
    );

    // 3. Cập nhật trạng thái đơn hàng và trạng thái thanh toán
    await db.query(
      `UPDATE don_hang
       SET trang_thai = 'Đang xử lý',
           trang_thai_thanh_toan = 'Chưa thanh toán',
           phuong_thuc_thanh_toan = 'COD'
       WHERE id_don_hang = ?`,
      [orderId]
    );

    // 4. Ghi lại lịch sử đơn hàng
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), 'Đang xử lý', 'Phương thức thanh toán COD - chờ thu tiền khi giao hàng')`,
      [orderId]
    );

    // 5. Lấy lại thông tin đơn hàng sau khi cập nhật
    const updatedOrder = await orderDetail(orderId);

    return updatedOrder;

  } catch (err) {
    console.error('❌ Lỗi payOrderCOD:', err);
    throw err;
  }
};

module.exports = { payOrderCOD };
