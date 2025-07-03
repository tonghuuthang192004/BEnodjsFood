const db = require('../../config/database');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const login = async (email, mat_khau) => {
  const sql = `SELECT * FROM nguoi_dung WHERE nguoi_dung.email = ?`;
  const [user] = await db.query(sql, [email]);

  if (user && user.length > 0) {
    const hashedPassword = md5(mat_khau);
    if (hashedPassword === user[0].mat_khau) {
      const payload = {
        id: user[0].id,
        email: user[0].email
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'mysecretkey',
        { expiresIn: '1d' }
      );

      return { ...user[0], token }; // 👈 Gắn token vào kết quả trả về
    }
  }

  return null;
};

module.exports = { login };
