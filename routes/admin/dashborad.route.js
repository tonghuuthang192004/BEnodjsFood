const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerDashboard=require('../../controllers/admin/dashboard.controller')

router.get('/',controllerDashboard.dashborad); 

// này / file chinh của product

module.exports = router;