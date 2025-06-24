const systemConfig = require('../../config/system');
const dashboardRoutes = require('./dashborad.route');
const productsRoute = require('./product.route');
const categoryRoute = require('./category.route');
const authRoute = require('./auth.route');
const orderRoute = require('./order.route');
const userRoute=require('./user.route');
module.exports = (app) => {
  const PathAdmin = systemConfig.prefixAdmin;
  app.use(PathAdmin + '/dashboard', dashboardRoutes);
  app.use(PathAdmin + '/products', productsRoute);
  app.use(PathAdmin + '/category', categoryRoute);
  app.use(PathAdmin + '/order', orderRoute);
  app.use(PathAdmin + '/auth', authRoute);
  app.use(PathAdmin+'/user',userRoute)
   app.listen(3000, () => {
    console.log(`Server running at http://localhost:3000${PathAdmin}`);
  });
};
