const express = require('express');
const router = express.Router();
const disCountManage = require('../../controllers/admin/discountMange.controller');

// router.post('/login', authController.LoginPost);

// const disCountManage=require('../.');

router.get('/',disCountManage.index)

module.exports = router;
