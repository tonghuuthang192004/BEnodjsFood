const express = require('express');
const router = express.Router();
const controllerProduct = require('../../controllers/client/product.controller');

router.get('/', controllerProduct.index);
router.get('/productId/:id', controllerProduct.productId);
router.get('/hot',controllerProduct.productHot);
module.exports = router;
