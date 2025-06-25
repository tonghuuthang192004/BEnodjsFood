// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports.authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]; // Kiểm tra token từ cookie hoặc header

  if (!token) {
    return res.status(403).json({ message: 'Token không tồn tại' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    // Lưu thông tin người dùng vào req.user
    req.user = decoded;
    next();
  });
};
