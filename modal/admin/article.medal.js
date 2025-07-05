const db=query('../../config/database.js');


// Lấy danh sách đánh giá
const getAllReviews = async () => {
  const [rows] = await db.query(
    'SELECT * FROM danh_gia WHERE deleted = 0 ORDER BY ngay_danh_gia DESC'
  );
  return rows;
};

// Lấy đánh giá theo ID
const getReviewById = async (id) => {
  const [rows] = await db.query('SELECT * FROM danh_gia WHERE id_danh_gia = ? AND deleted = 0', [id]);
  return rows[0];
};

// Thêm mới đánh giá
const addReview = async ({ id_san_pham, id_nguoi_dung, diem_so, nhan_xet, ngay_danh_gia }) => {
  const [result] = await db.query(
    `INSERT INTO danh_gia (id_san_pham, id_nguoi_dung, diem_so, nhan_xet, ngay_danh_gia, deleted, trang_thai)
     VALUES (?, ?, ?, ?, ?, 0, 'active')`,
    [id_san_pham, id_nguoi_dung, diem_so, nhan_xet, ngay_danh_gia]
  );
  return result.insertId;
};

// Cập nhật đánh giá
const updateReview = async (id, { diem_so, nhan_xet, trang_thai }) => {
  const [result] = await db.query(
    `UPDATE danh_gia SET diem_so = ?, nhan_xet = ?, trang_thai = ? WHERE id_danh_gia = ? AND deleted = 0`,
    [diem_so, nhan_xet, trang_thai, id]
  );
  return result.affectedRows > 0;
};

// Xóa mềm (đặt deleted = 1)
const softDeleteReview = async (id) => {
  const [result] = await db.query(
    `UPDATE danh_gia SET deleted = 1 WHERE id_danh_gia = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Thay đổi trạng thái (active / inactive)
const changeStatus = async (id, status) => {
  const [result] = await db.query(
    `UPDATE danh_gia SET trang_thai = ? WHERE id_danh_gia = ? AND deleted = 0`,
    [status, id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllReviews,
  getReviewById,
  addReview,
  updateReview,
  softDeleteReview,
  changeStatus,
};
