const express= require('express'); // improt vào để sài route vì express cung cấp cái route
const router=express.Router();
const controllerProduct=require('../../controllers/admin/product.controller')

const validate=require('../../validate/product.validate')
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

router.post('/create-product',
    
    upload.single('hinh_anh'),
    validate.creatPost
    ,controllerProduct.createProductItem);
router.get('/edit-product/:id_san_pham', controllerProduct.getEditProduct); // chỉ lấy data

router.post(
  '/edit-product/:id_san_pham',
  upload.single('hinh_anh'),          // phải đứng trước
  validate.editProduct,               // sau đó mới validate
  controllerProduct.editProduct       // cuối cùng là xử lý logic
);
router.get('/productDetail/:id_san_pham',controllerProduct.productDetail);
// này / file chinh của product

module.exports = router;    