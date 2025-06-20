const express = require('express');
const router = express.Router();
const cartController=require('../../controllers/client/cart.controller')


router.get('/', cartController.getUserCart);
router.post('/create', cartController.createCart);
router.get('/items', cartController.getCartItems);
router.put('/item', cartController.updateItemQuantity);
router.delete('/item', cartController.deleteItem);
module.exports = router;
