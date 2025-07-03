const db=require("../../config/database");

const revenue = async (from,to,type='day')=>{
    let format = '%Y-%m-%d'; // theo ngày mặc định
  if (type === 'month') format = '%Y-%m';
  if (type === 'year') format = '%Y';
  const sql = `
    SELECT 
      DATE_FORMAT(t.ngay_thanh_toan, ?) AS period,
      COUNT(DISTINCT dh.id_don_hang) AS totalOrders,
      SUM(t.so_tien) AS totalRevenue
    FROM thanh_toan t
    JOIN don_hang dh ON dh.id_don_hang = t.id_don_hang
    WHERE t.trang_thai = 'Đã thanh toán'
      AND dh.trang_thai = 'đã giao'
      AND t.ngay_thanh_toan BETWEEN ? AND ?
    GROUP BY period
    ORDER BY period;
  `;

  const [rows] = await db.execute(sql, [format, from, to]);
  return rows;

}

module.exports={
    revenue
}