const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();  // tạo app express trước

app.use(cors({
  origin: 'http://localhost:3001',  // cho phép React frontend truy cập
  credentials: true,                 // nếu có dùng cookie hoặc auth
}));



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

// listen
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
