const db = require("../../config/database");

const revenue = async (from, to, type = 'day') => {
  let format = '%Y-%m-%d';
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
};
const VAT = async (from, to, type = 'day') => {
  let format = '%Y-%m-%d';
  if (type === 'month') format = '%Y-%m';
  if (type === 'year') format = '%Y';

  const sql = `
    SELECT 
      DATE_FORMAT(t.ngay_thanh_toan, ?) AS period,
      SUM(t.so_tien) AS total_revenue,
      ROUND(SUM(t.so_tien) * 0.1, 0) AS vat_output
    FROM thanh_toan t
    JOIN don_hang dh ON t.id_don_hang = dh.id_don_hang
    WHERE t.trang_thai = 'Đã thanh toán'
      AND dh.trang_thai = 'đã giao'
      AND t.ngay_thanh_toan BETWEEN ? AND ?
    GROUP BY period
    ORDER BY period;
  `;

  const [rows] = await db.execute(sql, [format, from, to]);
  return rows;
};
const diCountMangerReport = async (from, to, type = 'day') => {
  let format = '%Y-%m-%d';
  if (type === 'month') format = '%Y-%m';
  if (type === 'year') format = '%Y';

  const sql = `
    SELECT 
      DATE_FORMAT(dh.ngay_tao, ?) AS ngay,
      COUNT(*) AS tong_so_don_hang,
      SUM(COALESCE(dh.gia_tri_giam, 0)) AS tong_giam_gia,
      SUM(dh.tong_gia_truoc_giam) AS tong_tien_truoc_khi_giam,
      SUM(dh.tong_gia) AS tong_tien_sau_khi_giam
    FROM don_hang dh
    WHERE dh.ngay_tao BETWEEN ? AND ?
    GROUP BY ngay
    ORDER BY ngay;
  `;
  const [rows] = await db.execute(sql, [format, from, to]); // ✅ Sửa chỗ này
  return rows;
};

const paymentMethod = async (from, to, type = 'day') => {
  let format = '%Y-%m-%d';
  if (type === 'month') format = '%Y-%m';
  if (type === 'year') format = '%Y';

  const sql = `
    SELECT 
      DATE_FORMAT(t.ngay_thanh_toan, ?) AS period,
      t.phuong_thuc AS payment_method,
      SUM(t.so_tien) AS total_amount
    FROM thanh_toan t
    JOIN don_hang dh ON t.id_don_hang = dh.id_don_hang
    WHERE t.trang_thai = 'Đã thanh toán'
      AND t.ngay_thanh_toan BETWEEN ? AND ?
    GROUP BY period, t.phuong_thuc
    ORDER BY period;
  `;
  const [rows] = await db.execute(sql, [format, from, to]); // ✅ Sửa chỗ này
  return rows;
};

module.exports = {
  revenue,
  VAT,
  diCountMangerReport,
  paymentMethod
};
