require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: process.env.DATABASE, // nhớ chắc chắn biến này đã set!
  timezone: '+07:00', // ✅ Đồng bộ timezone
  dateStrings: true,  // ✅ Tránh trả về Date thành Buffer
});

console.log('✅ Kết nối MySQL thành công!');

module.exports = pool;
