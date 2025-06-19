const productRouter=require('./product.route.js');
const homeRoute=require('./home.route.js')
const categoryRoute=require('./category.route.js')
module.exports=(app)=>{
app.get('/',homeRoute );
app.use('/products', productRouter);
app.use('/category',categoryRoute)
}