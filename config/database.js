const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: process.env.DATABASE, // nhớ chắc chắn biến này đã set!
});

console.log('✅ Kết nối MySQL thành công!');

module.exports = pool;
