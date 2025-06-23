const express = require('express');
const router = express.Router();
const controllerCategory = require('../../controllers/client/category.controller');

router.get('/:id', controllerCategory.index);
router.get('/',controllerCategory.home)
module.exports = router;
