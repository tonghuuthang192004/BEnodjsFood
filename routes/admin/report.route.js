const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerReport=require('../../controllers/admin/revenue.controller');
router.get('/revenue',controllerReport.getRevenue);
router.get('/vat',controllerReport.getVAT);
router.get('/diCountMangerReport',controllerReport.getDiscounts);
router.get('/paymentMethod',controllerReport.getPaymentMethods);

module.exports = router;