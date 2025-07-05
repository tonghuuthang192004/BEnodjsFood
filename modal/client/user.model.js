const db = require('../../config/database');

// 🔥 Tìm user theo email
const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM nguoi_dung WHERE email = ?',
    [email]
  );
  return rows[0];
};

// 🔥 Tìm user theo ID
const findById = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM nguoi_dung WHERE id_nguoi_dung = ?',
    [id]
  );
  return rows[0];
};

// 🔥 Tạo user mới
const create = async (data) => {
  const sql = `
    INSERT INTO nguoi_dung 
    (id_vai_tro, ten, email, mat_khau, so_dien_thoai, ma_xac_minh, ngay_tao, deleted)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), 1) -- 👈 Mặc định mở tài khoản
  `;
  const [result] = await db.query(sql, [
    data.id_vai_tro,
    data.ten,
    data.email,
    data.mat_khau,
    data.so_dien_thoai,
    data.ma_xac_minh
  ]);
  return result;
};


// 🔥 Cập nhật tên & số điện thoại
const updateProfile = async (id, ten, so_dien_thoai) => {
  const sql = `
    UPDATE nguoi_dung
    SET ten = ?, so_dien_thoai = ?, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [ten, so_dien_thoai, id]);
};

// 🔥 Cập nhật avatar
const updateAvatar = async (id, avatar) => {
  const sql = `
    UPDATE nguoi_dung
    SET avatar = ?, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [avatar, id]);
};

// 🔥 Cập nhật mật khẩu
const updatePassword = async (id, hashedPassword) => {
  const sql = `
    UPDATE nguoi_dung
    SET mat_khau = ?, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [hashedPassword, id]);
};

// 🔥 Cập nhật xác thực email
const verifyEmail = async (id) => {
  const sql = `
    UPDATE nguoi_dung
    SET xac_thuc_email = 1, ma_xac_minh = NULL, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [id]);
};

// 🔥 Cập nhật OTP
const updateOtp = async (id, otpCode, otpExpires) => {
  const sql = `
    UPDATE nguoi_dung
    SET ma_xac_minh = ?, otp_expires = ?, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [otpCode, otpExpires, id]);
};

// 🔥 Xóa OTP sau khi dùng
const clearOtp = async (id) => {
  const sql = `
    UPDATE nguoi_dung
    SET ma_xac_minh = NULL, otp_expires = NULL, ngay_cap_nhat = NOW()
    WHERE id_nguoi_dung = ?
  `;
  await db.query(sql, [id]);
};

module.exports = {
  findByEmail,
  findById,
  create,
  updateProfile,
  updateAvatar,
  updatePassword,
  verifyEmail,
  updateOtp,
  clearOtp
};
