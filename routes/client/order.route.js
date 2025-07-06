const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/client/order.controller');
const { authenticate } = require('../../helper/middleware');

router.get('/', authenticate, orderController.getOrderHistoriesByUser);
router.get('/lich-su', authenticate, orderController.getOrderHistoriesByUser);
router.get('/products/:id/reviews', authenticate, orderController.getReviews);
router.get('/:id', authenticate, orderController.getOrderDetailByUser);

router.post('/create', authenticate, orderController.createOrderAndPay);
router.patch('/:id/cancel', authenticate, orderController.cancelOrderByUser);
router.post('/:id/reorder', authenticate, orderController.reorder);
router.post('/:id/review', authenticate, orderController.reviewProduct);

router.post('/momo/callback', orderController.callback);




module.exports = router;
