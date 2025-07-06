
const productRouter = require('./product.route.js');
const homeRouter = require('./home.route.js');
const categoryRouter = require('./category.route.js');
const cartRouter = require('./cart.route.js');
const userRouter = require('./user.route.js');
const voucherRouter = require('./voucher.route.js');
const favoriteRouter = require('./favorite.route.js');
const addressRouter = require('./address.route.js');
const orderRouter = require('./order.route.js')
const paymentRouter = require('./payment.route.js')
module.exports = (app) => {
  app.use('/', homeRouter);
  app.use('/products', productRouter);
  app.use('/category', categoryRouter);
  app.use('/cart', cartRouter);
  app.use('/user', userRouter);
  app.use('/voucher', voucherRouter);
  app.use('/address', addressRouter);
  app.use('/favorite', favoriteRouter);
  app.use('/order',orderRouter);
  app.use('/payment', paymentRouter);
};
