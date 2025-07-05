const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerDashboard=require('../../controllers/admin/dashboard.controller')

router.get('/countProduct',controllerDashboard.countProduct); 
router.get('/countUser',controllerDashboard.countUser); 
router.get('/countOrder',controllerDashboard.countOrder); 
router.get('/countproductEvaluation',controllerDashboard.productEvaluation); 

// này / file chinh của product

module.exports = router;