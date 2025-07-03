const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/client/cart.controller');
const { authenticate } = require('../../helper/middleware');

router.get('/', authenticate, cartController.getUserCart);
router.post('/item', authenticate, cartController.addItemToCart);
router.put('/item/:id_san_pham', authenticate, cartController.updateItemQuantity);
router.delete('/item/:id_san_pham', authenticate, cartController.deleteItem);
router.delete('/clear', authenticate, cartController.clearCart);

module.exports = router;
