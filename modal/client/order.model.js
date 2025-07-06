const db = require('../../config/database');

// 📦 Tạo đơn hàng mới (COD / MoMo)
const createOrder = async (orderData) => {
  try {
    await db.query('START TRANSACTION');

    // 1️⃣ Insert đơn hàng
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

    // 2️⃣ Update momo_order_id
    const momo_order_id = `MOMO_${Date.now()}_${orderId}`;
    await db.query(
      `UPDATE don_hang SET momo_order_id = ? WHERE id_don_hang = ?`,
      [momo_order_id, orderId]
    );

    // 3️⃣ Lấy sản phẩm từ giỏ hàng
    const [cartItems] = await db.query(`
      SELECT gct.id_san_pham, gct.so_luong
      FROM gio_hang_chi_tiet gct
      JOIN gio_hang gh ON gct.id_gio_hang = gh.id_gio_hang
      WHERE gh.id_nguoi_dung = ?
    `, [orderData.id_nguoi_dung]);

    if (cartItems.length === 0) {
      throw new Error('Giỏ hàng trống. Không thể tạo đơn hàng.');
    }

    // 4️⃣ Insert chi tiết đơn hàng
    for (const item of cartItems) {
      await db.query(
        `INSERT INTO chi_tiet_don_hang (id_don_hang, id_san_pham, so_luong)
         VALUES (?, ?, ?)`,
        [orderId, item.id_san_pham, item.so_luong]
      );
    }

    // 5️⃣ Ghi lịch sử đơn hàng
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), 'Chưa xác nhận', 'Tạo đơn hàng mới')`,
      [orderId]
    );

    // 6️⃣ Xóa giỏ hàng của user
    await db.query(`
      DELETE gct
      FROM gio_hang_chi_tiet gct
      JOIN gio_hang gh ON gct.id_gio_hang = gh.id_gio_hang
      WHERE gh.id_nguoi_dung = ?
    `, [orderData.id_nguoi_dung]);

    await db.query('COMMIT');
    return { orderId, momo_order_id };

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Lỗi tạo đơn hàng:', err.message);
    throw err;
  }
};

// 📥 Lấy danh sách đơn hàng theo user
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

// 📥 Lấy chi tiết danh sách sản phẩm trong đơn hàng của user
const getOrderProductsByUser = async (orderId, userId) => {
  const [items] = await db.query(`
    SELECT 
      ctdh.id_san_pham,
      sp.ten AS productName,
      sp.hinh_anh AS imageUrl,
      sp.gia AS price,
      ctdh.so_luong AS quantity,
      (sp.gia * ctdh.so_luong) AS total
    FROM chi_tiet_don_hang ctdh
    INNER JOIN san_pham sp ON ctdh.id_san_pham = sp.id_san_pham
    INNER JOIN don_hang dh ON ctdh.id_don_hang = dh.id_don_hang
    WHERE ctdh.id_don_hang = ? 
      AND dh.id_nguoi_dung = ?
      AND sp.deleted = 0          
      AND sp.trang_thai = 1       
    ORDER BY ctdh.id_san_pham
  `, [orderId, userId]);

  return items;
};



const getOrderHistoriesByUser = async (userId, status) => {
  let sql = `
    SELECT lsdh.id_don_hang, lsdh.thoi_gian, lsdh.trang_thai, lsdh.mo_ta,
           dh.tong_gia, dh.phuong_thuc_thanh_toan
    FROM lich_su_don_hang lsdh
    JOIN don_hang dh ON lsdh.id_don_hang = dh.id_don_hang
    WHERE dh.id_nguoi_dung = ?
  `;
  const params = [userId];

  // 👉 Chỉ lọc nếu status khác 'Tất cả' và không null
  if (status && status !== 'Tất cả') {
    sql += ' AND lsdh.trang_thai = ?';
    params.push(status);
  }

  sql += ' ORDER BY lsdh.thoi_gian DESC';

  const [rows] = await db.query(sql, params);
  return rows;
};



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
const addReview = async (productId, userId, rating, comment) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Điểm số phải từ 1 đến 5');
  }
  if (!comment || comment.trim().length === 0) {
    throw new Error('Nhận xét không được để trống');
  }

  // Kiểm tra user có đơn hàng đã giao với sản phẩm đó không
  const [rows] = await db.query(`
    SELECT dh.id_don_hang
    FROM don_hang dh
    JOIN chi_tiet_don_hang ctdh ON dh.id_don_hang = ctdh.id_don_hang
    WHERE dh.id_nguoi_dung = ? AND dh.trang_thai = 'Đã giao' AND ctdh.id_san_pham = ?
  `, [userId, productId]);

  if (rows.length === 0) {
    throw new Error('Chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã giao.');
  }

  await db.query(`
    INSERT INTO danh_gia_san_pham (
      id_san_pham, id_nguoi_dung, diem_so, nhan_xet, ngay_danh_gia, deleted, trang_thai
    ) VALUES (?, ?, ?, ?, NOW(), 0, 'active')
  `, [productId, userId, rating, comment.trim()]);
};


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

const markOrderFailed = async (momoOrderId) => {
  await db.query(`
    UPDATE don_hang
    SET trang_thai = 'Đã hủy', trang_thai_thanh_toan = 'Thanh toán thất bại'
    WHERE momo_order_id = ?
  `, [momoOrderId]);
};

const getProductsFromOrder = async (orderId, userId) => {
  const [rows] = await db.query(`
    SELECT ctdh.id_san_pham, ctdh.so_luong
    FROM chi_tiet_don_hang ctdh
    JOIN don_hang dh ON dh.id_don_hang = ctdh.id_don_hang
    WHERE dh.id_don_hang = ? AND dh.id_nguoi_dung = ?
  `, [orderId, userId]);
  return rows;
};

const getReviewsByProductId = async (productId) => {
  const [reviews] = await db.query(`
    SELECT dg.id_danh_gia, dg.id_nguoi_dung, nd.ten AS ten_nguoi_dung,
           dg.diem_so, dg.nhan_xet, dg.ngay_danh_gia
    FROM danh_gia_san_pham dg
    JOIN nguoi_dung nd ON dg.id_nguoi_dung = nd.id_nguoi_dung
    WHERE dg.id_san_pham = ? AND dg.deleted = 0 AND dg.trang_thai = 'active'
    ORDER BY dg.ngay_danh_gia DESC
  `, [productId]);
  return reviews;
};

const deleteOrder = async (orderId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM don_hang WHERE id_don_hang = ?`,
      [orderId]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error('❌ Lỗi deleteOrder:', err);
    throw new Error('Không thể xóa đơn hàng');
  }
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  getOrderProductsByUser, // hàm mới lấy chi tiết sản phẩm đơn hàng
  getOrderHistoriesByUser,
  cancelOrderByUser,
  addReview,
  markOrderPaid,
  markOrderFailed,
  getProductsFromOrder,
  getReviewsByProductId,
  deleteOrder
};
