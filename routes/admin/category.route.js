const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const categoryController=require('../../controllers/admin/category.controller')

router.get('/',categoryController.index);




module.exports = router;
