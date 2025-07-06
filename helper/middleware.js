// middleware/auth.js
require('dotenv').config(); // Đảm bảo rằng dotenv được import ở đầu file

// const jwt = require('jsonwebtoken');

// module.exports.authenticate = (req, res, next) => {
//   const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Kiểm tra token từ cookie hoặc header

//   if (!token) {
//     return res.status(403).json({ message: 'Token không tồn tại' });
//   }

//   jwt.verify(token, 'your-secret-key', (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: 'Token không hợp lệ' });
//     }

//     // Lưu thông tin người dùng vào req.user
//     req.user = decoded;
//     next();
//   });
// };

const jwt = require('jsonwebtoken');

// 🛡️ Middleware xác thực token JWT
const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'Authorization header không hợp lệ hoặc thiếu' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer"

    if (!token) {
      return res.status(403).json({ error: 'Token không tồn tại' });
    }

    // Xác thực token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const message =
          err.name === 'TokenExpiredError'
            ? 'Token đã hết hạn'
            : 'Token không hợp lệ';
        return res.status(401).json({ error: message });
      }

      // 👌 Gắn thông tin user vào request để dùng ở controller
      req.user = decoded; // decoded chứa { id: id_nguoi_dung, iat, exp }
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Lỗi server khi xác thực' });
  }
};

module.exports = { authenticate };
