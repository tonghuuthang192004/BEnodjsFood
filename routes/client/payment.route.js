

const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerDashboard=require('../../controllers/client/payment.controller')

router.post('/:id/orders',controllerDashboard.payOrderCODController); 

// router.post('/paymentMomo',controllerDashboard.payMentMomo);
router.post('/callback',controllerDashboard.callback);
router.post('/statusPayment',controllerDashboard.statusPayment)


module.exports = router;