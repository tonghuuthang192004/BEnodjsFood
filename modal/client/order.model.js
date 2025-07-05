const db = require('../../config/database');

// 📦 Tạo đơn hàng mới (COD / MoMo)
const createOrder = async (orderData) => {
  try {
    await db.query('START TRANSACTION');

    // 1. Insert đơn hàng (đã có giảm giá nếu có)
    const insertQuery = `
      INSERT INTO don_hang (
        id_nguoi_dung,
        id_dia_chi,
        phuong_thuc_thanh_toan,
        trang_thai,
        trang_thai_thanh_toan,
        tong_gia,
        tong_gia_truoc_giam,
        gia_tri_giam,
        id_giam_gia,
        ghi_chu,
        ngay_tao
      ) VALUES (?, ?, ?, 'Chưa xác nhận', 'Chưa thanh toán', ?, ?, ?, ?, ?, NOW())
    `;

    const insertValues = [
      orderData.id_nguoi_dung,
      orderData.id_dia_chi,
      orderData.phuong_thuc_thanh_toan,
      orderData.tong_gia,
      orderData.tong_gia_truoc_giam || null,
      orderData.gia_tri_giam || 0,
      orderData.id_giam_gia || null,
      orderData.ghi_chu || null,
    ];

    const [result] = await db.query(insertQuery, insertValues);

    const orderId = result.insertId;
    const momo_order_id = `MOMO_${Date.now()}_${orderId}`;

    // 2. Update momo_order_id
    await db.query(
      `UPDATE don_hang SET momo_order_id = ? WHERE id_don_hang = ?`,
      [momo_order_id, orderId]
    );

    // 3. Insert chi tiết đơn hàng
    for (const item of orderData.chi_tiet_san_pham) {
      await db.query(
        `INSERT INTO chi_tiet_don_hang (id_don_hang, id_san_pham, so_luong, ghi_chu)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id_san_pham, item.so_luong, item.ghi_chu || null]
      );
    }

    // 4. Ghi lịch sử
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), 'Chưa xác nhận', 'Tạo đơn hàng mới')`,
      [orderId]
    );

    await db.query('COMMIT');
    return { orderId, momo_order_id };

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Lỗi tạo đơn hàng:', err.message);
    throw err;
  }
};
// 📥 Lấy danh sách đơn hàng của user (có lọc trạng thái)
const getOrdersByUserId = async (userId, status) => {
  let sql = `
    SELECT id_don_hang, ngay_tao, trang_thai, tong_gia,
           phuong_thuc_thanh_toan, trang_thai_thanh_toan
    FROM don_hang
    WHERE id_nguoi_dung = ?
  `;
  const params = [userId];

  if (status) {
    sql += ' AND trang_thai = ?';
    params.push(status);
  }

  sql += ' ORDER BY ngay_tao DESC';
  const [rows] = await db.query(sql, params);
  return rows;
};

// 📥 Lấy chi tiết đơn hàng
const getOrderDetailByUser = async (orderId, userId) => {
  const [orders] = await db.query(`
    SELECT dh.*, dc.dia_chi_day_du
    FROM don_hang dh
    LEFT JOIN dia_chi dc ON dh.id_dia_chi = dc.id
    WHERE dh.id_don_hang = ? AND dh.id_nguoi_dung = ?
  `, [orderId, userId]);

  if (orders.length === 0) return null;
  const order = orders[0];

  const [items] = await db.query(`
    SELECT ctdh.id_san_pham, sp.ten AS ten_san_pham, sp.gia, ctdh.so_luong, ctdh.ghi_chu
    FROM chi_tiet_don_hang ctdh
    JOIN san_pham sp ON ctdh.id_san_pham = sp.id_san_pham
    WHERE ctdh.id_don_hang = ?
  `, [orderId]);
  order.chi_tiet_san_pham = items;

  const [history] = await db.query(`
    SELECT thoi_gian, trang_thai, mo_ta
    FROM lich_su_don_hang
    WHERE id_don_hang = ? ORDER BY thoi_gian ASC
  `, [orderId]);
  order.lich_su_trang_thai = history;

  return order;
};

// 🗑️ Huỷ đơn hàng
const cancelOrderByUser = async (orderId, userId) => {
  const [result] = await db.query(`
    UPDATE don_hang
    SET trang_thai = 'Đã hủy',
        trang_thai_thanh_toan = IF(trang_thai_thanh_toan = 'Đã thanh toán', 'Đã hoàn tiền', trang_thai_thanh_toan)
    WHERE id_don_hang = ? AND id_nguoi_dung = ? AND trang_thai = 'Chưa xác nhận'
  `, [orderId, userId]);

  if (result.affectedRows === 0) {
    throw new Error('Không thể huỷ đơn hàng. Đơn đã xử lý hoặc không thuộc về bạn.');
  }

  await db.query(`
    INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
    VALUES (?, NOW(), 'Đã hủy', 'Người dùng huỷ đơn hàng')
  `, [orderId]);
};

// ⭐ Đánh giá sản phẩm (chỉ khi đã thanh toán và giao)
const addReview = async (productId, userId, rating, comment) => {
  // Kiểm tra trạng thái đơn và thanh toán
  const [rows] = await db.query(`
    SELECT dh.id_don_hang
    FROM don_hang dh
    JOIN thanh_toan tt ON dh.id_don_hang = tt.id_don_hang
    WHERE dh.id_nguoi_dung = ? AND dh.trang_thai = 'Đã giao'
          AND tt.trang_thai = 'Đã thanh toán'
  `, [userId]);

  if (rows.length === 0) {
    throw new Error('Chỉ có thể đánh giá sau khi đơn hàng đã giao và thanh toán thành công.');
  }

  // Thêm đánh giá
  await db.query(`
    INSERT INTO danh_gia_san_pham (id_san_pham, id_nguoi_dung, diem_so, nhan_xet, ngay_danh_gia)
    VALUES (?, ?, ?, ?, NOW())
  `, [productId, userId, rating, comment]);
};

// 💳 Đánh dấu thanh toán thành công
const markOrderPaid = async (momoOrderId, amount, method) => {
  await db.query(`
    UPDATE don_hang
    SET trang_thai = 'Đã giao', trang_thai_thanh_toan = 'Đã thanh toán', phuong_thuc_thanh_toan = ?
    WHERE momo_order_id = ? AND trang_thai_thanh_toan = 'Chưa thanh toán'
  `, [method, momoOrderId]);

  await db.query(`
    INSERT INTO thanh_toan (id_don_hang, so_tien, phuong_thuc, trang_thai, ngay_thanh_toan)
    SELECT id_don_hang, ?, ?, 'Đã thanh toán', NOW()
    FROM don_hang WHERE momo_order_id = ?
  `, [amount, method, momoOrderId]);
};

// 💥 Đánh dấu thanh toán thất bại
const markOrderFailed = async (momoOrderId) => {
  await db.query(`
    UPDATE don_hang
    SET trang_thai = 'Đã hủy', trang_thai_thanh_toan = 'Thanh toán thất bại'
    WHERE momo_order_id = ?
  `, [momoOrderId]);
};

// 📦 Lấy sản phẩm từ đơn hàng (phục vụ cho mua lại)
const getProductsFromOrder = async (orderId, userId) => {
  const [rows] = await db.query(`
    SELECT ctdh.id_san_pham, ctdh.so_luong
    FROM chi_tiet_don_hang ctdh
    JOIN don_hang dh ON dh.id_don_hang = ctdh.id_don_hang
    WHERE dh.id_don_hang = ? AND dh.id_nguoi_dung = ?
  `, [orderId, userId]);

  return rows;
};

// 📦 Export tất cả
module.exports = {
  createOrder,
  getOrdersByUserId,
  getOrderDetailByUser,
  cancelOrderByUser,
  addReview,
  markOrderPaid,
  markOrderFailed,
  getProductsFromOrder
};
