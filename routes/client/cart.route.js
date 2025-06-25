// routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller');
const authMiddleware = require('../../helper/middleware');  // Thêm middleware xác thực

router.get('/', authMiddleware.authenticate, cartController.getUserCart);
router.post('/create', authMiddleware.authenticate, cartController.createCart);
router.get('/items', authMiddleware.authenticate, cartController.getCartItems);
router.put('/item', authMiddleware.authenticate, cartController.updateItemQuantity);
router.delete('/item', authMiddleware.authenticate, cartController.deleteItem);

module.exports = router;
