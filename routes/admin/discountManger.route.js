const express = require('express');
const router = express.Router();
const disCountManage = require('../../controllers/admin/discountMange.controller');

// router.post('/login', authController.LoginPost);

// const disCountManage=require('../.');

router.get('/',disCountManage.index)

router.put('/change-status/:status/:id', disCountManage.changeStatus);
router.put('/change-multi',disCountManage.changeMulti);
router.delete('/deleted/:id',disCountManage.deletedId);
router.delete('/delete-multiple',disCountManage.deleteMultiple)
router.post('/createDisCountManger',disCountManage.createDisCountManger);
router.get('/edit-discountManger/:id_giam_gia', disCountManage.getEditDisCountMangerID); // chỉ lấy data

router.post(
  '/edit-discountManger/:id_giam_gia',
         // phải đứng trước
//   validate.editProduct,               // sau đó mới validate
  disCountManage.EditDisCountManger       // cuối cùng là xử lý logic
);
module.exports = router;
