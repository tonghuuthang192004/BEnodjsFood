const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const orderController=require('../../controllers/admin/order.controller')
router.get('/',orderController.getOrder);
router.get('/orderDetal/:id',orderController.detailOrder)
router.patch('/order/:id',orderController.updateOrderStatus)
module.exports = router;
