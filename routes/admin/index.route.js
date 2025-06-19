const systemConfig=require('../../config/system');
const dashboardRoutes=require('./dashborad.route');
const productsRoute=require('./product.route');
const categoryRoute=require('./category.route');
module.exports=(app)=>{
    
const PathADmin=systemConfig.prefixAdmin
app.use(PathADmin+'/dashboard',dashboardRoutes );
app.use(PathADmin+'/products',productsRoute)
app.use(PathADmin+'/category',categoryRoute)
}