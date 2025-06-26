const db=require('../config/database');


const getOrder =  async (status)=>{
    let sql=`SELECT
                dh.id_don_hang,
                dh.id_nguoi_dung,
                nd.ten AS ten_nguoi_dung,
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
                dia_chi dc ON dh.id_dia_chi = dc.id`;
    const params=[];
    if(status)
    {
        sql+= ` WHERE dh.trang_thai = ? `;
        params.push(status);
    }
    sql+= ` ORDER BY dh.ngay_tao DESC `;
    const [rows]=await db.query(sql,params)
    return rows;
}


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



const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // 1. Kiểm tra trạng thái hiện tại
    const [rows] = await db.query(
      'SELECT trang_thai FROM don_hang WHERE id_don_hang = ?',
      [orderId]
    );

    if (rows.length === 0) throw new Error('Không tìm thấy đơn hàng');

    const order = rows[0];

    if (order.trang_thai === newStatus) {
      throw new Error(`Trạng thái đơn hàng đã là "${newStatus}"`);
    }

    // 2. Cập nhật trạng thái mới
    const [updateResult] = await db.query(
      'UPDATE don_hang SET trang_thai = ? WHERE id_don_hang = ?',
      [newStatus, orderId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('Không thể cập nhật trạng thái đơn hàng');
    }

    // 3. Ghi log vào lịch sử
    await db.query(
      `INSERT INTO lich_su_don_hang (id_don_hang, thoi_gian, trang_thai, mo_ta)
       VALUES (?, NOW(), ?, ?)`,
      [orderId, newStatus, `Trạng thái chuyển thành ${newStatus}`]
    );

    // 4. Lấy lại chi tiết đơn hàng sau khi cập nhật
    const updated = await orderDetail(orderId);
    return updated;

  } catch (err) {
    throw err;
  }
};


module.exports={
    getOrder,
    orderDetail,
    updateOrderStatus
 

}