const db = require('../../config/database');
const {orderDetail}=require('../../modal/admin/orderMedal');
const payOrderCOD = async (orderId) => {
  try {
    // 1. Kiểm tra đơn hàng tồn tại
    const [rows] = await db.query(
      'SELECT * FROM don_hang WHERE id_don_hang = ?',
      [orderId]
    );
    // console.log('Kết quả truy vấn:', rows);
    // console.log('orderId nhận được là:', orderId);


    if (rows.length === 0) throw new Error('Không tìm thấy đơn hàng');

    const order = rows[0];

    if (order.trang_thai_thanh_toan === 'Đã thanh toán') {
      throw new Error('Đơn hàng đã được thanh toán');
    }

    // 2. Cập nhật trạng thái thanh toán sang COD (chưa thanh toán thật, nhưng ghi nhận)
    await db.query(
      `INSERT INTO thanh_toan (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan)
       VALUES (?, ?, ?, 'Chờ thanh toán', NOW())`,
      [orderId, order.tong_gia, 'COD']
    );

    // 3. Cập nhật trạng thái thanh toán trong bảng don_hang thành 'Chờ thanh toán'
    await db.query(
      `UPDATE don_hang SET trang_thai_thanh_toan = 'Chờ thanh toán' WHERE id_don_hang = ?`,
      [orderId]
    );

    // 4. Cập nhật trạng thái đơn hàng thành 'Đang xử lý'
    await db.query(
      `UPDATE don_hang SET trang_thai = 'Đang xử lý' WHERE id_don_hang = ?`,
      [orderId]
    );

    // 5. Ghi lại lịch sử đơn hàng
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), 'Chờ thanh toán', 'Phương thức thanh toán COD - chờ thu tiền khi giao hàng')`,
      [orderId]
    );

    // 6. Lấy lại thông tin đơn hàng sau khi cập nhật
    const updatedOrder = await orderDetail(orderId)

    return updatedOrder;

  } catch (err) {
    throw err;
  }
};

module.exports = { payOrderCOD };
