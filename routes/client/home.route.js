const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerHome=require('../../controllers/client/home.controller')

router.get('/',controllerHome.index); 
// này / file chinh của product

module.exports = router;