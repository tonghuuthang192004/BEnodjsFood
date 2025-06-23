const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');

router.post('/login', authController.LoginPost);

module.exports = router;
