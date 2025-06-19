const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerProduct=require('../../controllers/admin/product.controller')

const storgaMulter=require('../../helper/storge')
// multer
const multer  = require('multer')





const upload = multer( { storage: storgaMulter()})

//end multer

router.get('/',controllerProduct.index); 
router.put('/change-status/:status/:id', controllerProduct.changeStatus);
router.put('/change-multi',controllerProduct.changeMulti);
router.delete('/deleted/:id',controllerProduct.deleteId);
router.delete('/delete-multiple',controllerProduct.deleteMultiple)
router.post('/create-product',upload.single('hinh_anh'),controllerProduct.createProductItem)
router.post('/eidt-product',controllerProduct.editProduct)

// này / file chinh của product

module.exports = router;    