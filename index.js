
// const express = require('express');
// require('dotenv').config();
// const cookieParser = require('cookie-parser');  // Import cookie-parser

// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();  // tạo app express trước

// app.use(cors({
//   origin: 'http://localhost:3001',  // cho phép React frontend truy cập
//   credentials: true,      
//              // nếu có dùng cookie hoặc auth
// }));

// app.use(cookieParser()); // Dùng cookie-parser để xử lý cookies

// var path=require('path')

// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// // upload 
// const database = require('./config/database');
// app.use(bodyParser.json());  // Để có thể parse body JSON

// const systemConfig = require('./config/system');

// const port = process.env.PORT;

// const route = require('./routes/client/index.route');
// const routeAdmin = require('./routes/admin/index.route');

// app.locals.prefixAdmin = systemConfig.prefixAdmin; // biến toàn cục

// app.set('views', './views');
// app.set('view engine', 'pug');
// app.use(express.static('public'));

// // gọi route
// route(app);
// routeAdmin(app);

// // tinymce
// app.use('/tinymce',express.static(
//   path.join(__dirname,'node_modules','tinymce')
// ))


// // listen
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Example app listening on port ${port}`);
// });

const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ✅ CORS cho phép React hoặc Flutter truy cập
app.use(cors({
  origin: [
    'http://localhost:3001', // React dev server
    'http://localhost:8080', // Flutter web (nếu dùng)
    'http://127.0.0.1:3000', // Thêm frontend khác nếu cần
  ],
  credentials: true, // Cho phép cookie và auth
}));

// ✅ Middleware
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Static files & view
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// ✅ Database
require('./config/database');

// ✅ Routes
const systemConfig = require('./config/system');
app.locals.prefixAdmin = systemConfig.prefixAdmin;

const clientRoutes = require('./routes/client/index.route');
const adminRoutes = require('./routes/admin/index.route');
clientRoutes(app);
adminRoutes(app);

// ✅ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '🔗 API route không tồn tại!',
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Lỗi toàn cục:', err);
  res.status(500).json({
    success: false,
    message: '🔥 Server Error',
    error: err.message,
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

