///import express module
const express = require('express');

// import product controller
const productController = require('../controllers/productControllers');
const authControllers = require('../controllers/authControllers');

////set router
const router = express.Router();

router.use(
    authControllers.protect,
    authControllers.restrictTo('vendor'),
    authControllers.verifyVendor
);

router.get('/', productController.getVendorHome);

router.get('/orders', productController.getVendorOrders);

router.get('/orders/:orderId', productController.getOrderDetails);

router.get('/products', productController.getMyProducts);

router.get('/products/:productId', productController.getMyProduct);

////////////export router
module.exports = router;
