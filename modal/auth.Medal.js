const db = require('../config/database'); // <-- Đảm bảo đường dẫn tới module kết nối CSDL đúng
const md5 = require('md5');           // <-- Bạn đang dùng thư viện mã hóa MD5

const login = async (email, mat_khau) => {
  const sql = `SELECT * FROM nguoi_dung WHERE nguoi_dung.email = ?`;
  const [user] = await db.query(sql, [email]);

  if (user && user.length > 0) {
    const hashedPassword = md5(mat_khau); // Mã hóa mật khẩu nhập vào
    if (hashedPassword === user[0].mat_khau) {
      return user[0]; // Mật khẩu khớp
    }
  }

  return null; // Sai email hoặc mật khẩu
};

module.exports = { login };
