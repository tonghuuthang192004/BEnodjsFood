const db = require('../../config/database');
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
const getOrder = async (filters = {}) => {
  let sql = `
    SELECT SQL_CALC_FOUND_ROWS
      dh.id_don_hang,
      dh.id_nguoi_dung,
      nd.ten AS ten_nguoi_dung,
      dh.ngay_tao,
      dh.trang_thai,
      dh.phuong_thuc_thanh_toan,
      dh.trang_thai_thanh_toan,
      dh.tong_gia,
      dh.ghi_chu,
      dc.dia_chi_day_du,
      nd.so_dien_thoai
    FROM don_hang dh
    JOIN nguoi_dung nd ON dh.id_nguoi_dung = nd.id_nguoi_dung
    LEFT JOIN dia_chi dc ON dh.id_dia_chi = dc.id
    WHERE 1
  `;

  const params = [];

  if (filters.status) {
    sql += ` AND dh.trang_thai = ?`;
    params.push(filters.status);
  }

 if (filters.search !== undefined) {
   const keyword = `%${filters.search.toLowerCase()}%`;
  sql += ' AND (LOWER(ten) LIKE ? OR so_dien_thoai LIKE ?)';
  params.push(keyword, filters.search); // 1 cho ten, 1 cho sdt
  }

  sql += ` ORDER BY dh.ngay_tao DESC`;

  if (filters.limit !== undefined && filters.offset !== undefined) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(filters.limit, filters.offset);
  }

  console.log('SQL:', sql);
  console.log('Params:', params);

  const [rows] = await db.query(sql, params);
  const [[{ total }]] = await db.query('SELECT FOUND_ROWS() AS total');

  return { orders: rows, total };
};

// const getOrder =  async (status)=>{
//     let sql=`SELECT
//                 dh.id_don_hang,
//                 dh.id_nguoi_dung,
//                 nd.ten AS ten_nguoi_dung,
//                 dh.ngay_tao,
//                 dh.trang_thai,
//                 dh.phuong_thuc_thanh_toan,
//                 dh.trang_thai_thanh_toan,
//                 dh.tong_gia,
//                 dh.ghi_chu,
//                 dc.dia_chi_day_du
//             FROM
//                 don_hang dh
//             JOIN
//                 nguoi_dung nd ON dh.id_nguoi_dung = nd.id_nguoi_dung
//             LEFT JOIN
//                 dia_chi dc ON dh.id_dia_chi = dc.id`;
//     const params=[];
//     if(status)
//     {
//         sql+= ` WHERE dh.trang_thai = ? `;
//         params.push(status);
//     }
//     sql+= ` ORDER BY dh.ngay_tao DESC `;
//     const [rows]=await db.query(sql,params)
//     return rows;
// }


const orderDetail = async(orderId)=>{
    const result =await db.query(`
        SELECT
                dh.id_don_hang,
                dh.id_nguoi_dung,
                nd.ten AS ten_nguoi_dung,
                nd.email,
                nd.so_dien_thoai,
                dh.ngay_tao,
                dh.trang_thai,
                dh.phuong_thuc_thanh_toan,
                dh.trang_thai_thanh_toan,
                dh.tong_gia,
                dh.ghi_chu,
                dc.dia_chi_day_du
            FROM
                don_hang dh
            JOIN
                nguoi_dung nd ON dh.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN
                dia_chi dc ON dh.id_dia_chi = dc.id
            WHERE
                dh.id_don_hang = ?
        `,[orderId]) 

    if(result.length===0) return 0;
    const order=result[0];
    const itemOrder= await db.query(`SELECT
                ctdh.id_chi_tiet,
                ctdh.id_san_pham,
                sp.ten AS ten_san_pham,
                sp.gia AS gia_don_vi,
                ctdh.so_luong,
                ctdh.ghi_chu
            FROM
                chi_tiet_don_hang ctdh
            JOIN
                san_pham sp ON ctdh.id_san_pham = sp.id_san_pham
            WHERE
                ctdh.id_don_hang = ?
        `, [orderId])
        order.chi_tiet_san_pham=itemOrder;
         const [historyRows] = await db.query(`
            SELECT
                lsdh.thoi_gian,
                lsdh.trang_thai,
                lsdh.mo_ta
            FROM
                lich_su_don_hang lsdh
            WHERE
                lsdh.id_don_hang = ?
            ORDER BY
                lsdh.thoi_gian ASC
        `, [orderId]);

        order.lich_su_trang_thai = historyRows;

        console.log(`Successfully fetched details for order ID ${orderId}.`);
        return order;


}


const updateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
  try {
    // Bước 1: Lấy thông tin đơn hàng hiện tại
    const [rows] = await db.query(
      'SELECT trang_thai, trang_thai_thanh_toan, tong_gia, phuong_thuc_thanh_toan FROM don_hang WHERE id_don_hang = ?',
      [orderId]
    );

    if (rows.length === 0) throw new Error('Không tìm thấy đơn hàng');

    const order = rows[0];
    console.log('Order hiện tại:', order);

    // Bước 2: Cập nhật trạng thái đơn hàng nếu có sự thay đổi
    let sql = 'UPDATE don_hang SET trang_thai = ?';
    const params = [newStatus];

    // Nếu trạng thái thanh toán thay đổi, cập nhật nó
    if (newPaymentStatus && newPaymentStatus !== order.trang_thai_thanh_toan) {
      sql += ', trang_thai_thanh_toan = ?';
      params.push(newPaymentStatus);
    }

    // Xác định điều kiện để cập nhật trạng thái đơn hàng
    sql += ' WHERE id_don_hang = ?';
    params.push(orderId);

    const [updateResult] = await db.query(sql, params);

    if (updateResult.affectedRows === 0) {
      throw new Error('Không thể cập nhật trạng thái đơn hàng');
    }

    console.log(`Đã cập nhật trạng thái đơn hàng, affectedRows: ${updateResult.affectedRows}`);

    // Bước 3: Xử lý thanh toán khi trạng thái là "Đã giao"
    if (newStatus === 'Đã giao') {
      console.log('Trạng thái đơn hàng đã chuyển thành "Đã giao"');

      // Kiểm tra thanh toán
      const [checkPayment] = await db.query('SELECT * FROM thanh_toan WHERE id_don_hang = ?', [orderId]);
      console.log('Kiểm tra thanh toán:', checkPayment);

      if (checkPayment.length > 0) {
  // Kiểm tra xem trạng thái thanh toán có phải là 'Chờ thanh toán' không
  if (checkPayment[0].trang_thai === 'Chờ thanh toán') {
    // Cập nhật trạng thái thanh toán thành "Đã thanh toán"
    await db.query(`
      UPDATE thanh_toan 
      SET trang_thai = 'Đã thanh toán', ngay_thanh_toan = NOW() 
      WHERE id_don_hang = ?
    `, [orderId]);

    console.log('Cập nhật trạng thái thanh toán thành "Đã thanh toán".');
  } else {
    console.log('Trạng thái thanh toán đã là "Đã thanh toán" hoặc trạng thái khác.');
  }

  // Cập nhật lại trạng thái thanh toán trong bảng don_hang
  if (order.trang_thai_thanh_toan !== 'Đã thanh toán') {
    await db.query(`
      UPDATE don_hang SET trang_thai_thanh_toan = 'Đã thanh toán' WHERE id_don_hang = ?
    `, [orderId]);
    console.log('Cập nhật trạng thái thanh toán trong bảng don_hang thành "Đã thanh toán".');
  }
} else {
  console.log('Không có thanh toán để cập nhật.');
}
    } 

    // Bước 4: Xử lý thanh toán khi trạng thái là "Đã hủy"
    else if (newStatus === 'Đã hủy') {
      console.log('Trạng thái đơn hàng đã chuyển thành "Đã hủy"');

      // Kiểm tra xem có thanh toán không
      const [payments] = await db.query('SELECT * FROM thanh_toan WHERE id_don_hang = ?', [orderId]);
      if (payments.length > 0) {
        // Nếu có thanh toán, cập nhật trạng thái thanh toán thành "Đã hoàn tiền"
        await db.query(`
          UPDATE thanh_toan
          SET trang_thai = 'Đã hoàn tiền'
          WHERE id_don_hang = ?
        `, [orderId]);

        await db.query(`
          UPDATE don_hang SET trang_thai_thanh_toan = 'Đã hoàn tiền' WHERE id_don_hang = ?
        `, [orderId]);

        console.log('Trạng thái thanh toán của đơn hàng đã được cập nhật thành "Đã hoàn tiền".');
      } else {
        console.log('Không có thanh toán để hoàn tiền.');
      }
    }

    // Bước 5: Ghi lại lịch sử thay đổi trạng thái
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), ?, ?)`, 
      [orderId, newStatus, `Trạng thái chuyển thành ${newStatus}`]
    );

    // Bước 6: Trả về chi tiết đơn hàng sau khi cập nhật
    const updated = await orderDetail(orderId);
    console.log('Đơn hàng sau cập nhật:', updated);
    return updated;

  } catch (err) {
    console.error('Lỗi trong quá trình cập nhật trạng thái đơn hàng:', err);
    throw err;
  }
};




// const updatePaymentStatus = async (orderId, newPaymentStatus) => {
//   try {
//     // 1. Kiểm tra đơn hàng có tồn tại không
//     const [rows] = await db.query(
//       'SELECT id_don_hang FROM don_hang WHERE id_don_hang = ?',
//       [orderId]
//     );
//     if (rows.length === 0) {
//       throw new Error('Không tìm thấy đơn hàng');
//     }

//     // 2. Cập nhật trạng thái thanh toán
//     const [updateResult] = await db.query(
//       'UPDATE don_hang SET trang_thai_thanh_toan = ? WHERE id_don_hang = ?',
//       [newPaymentStatus, orderId]
//     );

//     if (updateResult.affectedRows === 0) {
//       throw new Error('Cập nhật trạng thái thanh toán thất bại');
//     }

//     // 3. Ghi log lịch sử
//     await db.query(
//       `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
//        VALUES (?, NOW(), ?, ?)`,
//       [orderId, newPaymentStatus, `Thanh toán chuyển thành ${newPaymentStatus}`]
//     );

//     // 4. Trả về chi tiết đơn hàng đã cập nhật (nếu cần)
//     const updatedOrder = await orderDetail(orderId);
//     return updatedOrder;
    

//   } catch (error) {
//     console.error('Lỗi cập nhật trạng thái thanh toán:', error.message);
//     throw error;
//   }
// };
const deleteOrder = async (orderId) => {
  const [result] = await db.query(
    'DELETE FROM don_hang WHERE id_don_hang = ?',
    [orderId]
  );
  return result;
};
module.exports={
    createOrder,
    getOrder,
    orderDetail,
    updateOrderStatus,
    deleteOrder
    
 

}

