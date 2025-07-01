
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');  // Import cookie-parser

const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();  // tạo app express trước

app.use(cors({
  origin: 'http://localhost:3001',  // cho phép React frontend truy cập
  credentials: true,      
             // nếu có dùng cookie hoặc auth
}));

app.use(cookieParser()); // Dùng cookie-parser để xử lý cookies

var path=require('path')

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// upload 
const database = require('./config/database');
app.use(bodyParser.json());  // Để có thể parse body JSON

const systemConfig = require('./config/system');

const port = process.env.PORT;

const route = require('./routes/client/index.route');
const routeAdmin = require('./routes/admin/index.route');

app.locals.prefixAdmin = systemConfig.prefixAdmin; // biến toàn cục

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));

// gọi route
route(app);
routeAdmin(app);

// tinymce
app.use('/tinymce',express.static(
  path.join(__dirname,'node_modules','tinymce')
))


// listen
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
});
