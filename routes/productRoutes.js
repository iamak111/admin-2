///import express module
const express = require('express');

// import product controller
const productController = require('../controllers/productControllers');
const authControllers = require('../controllers/authControllers');

////set router
const router = express.Router();

router
    .route('/')
    .post(
        authControllers.protect,
        authControllers.restrictTo('vendor'),
        authControllers.verifyVendor,
        productController.assignDataForCreateNewProduct,
        productController.createProduct
    )
    .get(authControllers.protect, productController.getAllProduct);

router.get(
    '/recommended-products',
    productController.getRecommendedProducts,
    productController.sendRecommendedProducts
);

router

    .route('/:productId')
    .patch(
        authControllers.protect,
        authControllers.restrictTo('vendor'),
        authControllers.verifyVendor,
        productController.assignDataForUpdateNewProduct,
        productController.updateProduct
    )
    .delete(
        authControllers.protect,
        authControllers.restrictTo('vendor'),
        authControllers.verifyVendor,
        productController.deleteProudct
    )
    .get(
        authControllers.protect,
        productController.getAProduct,
        productController.sendAProduct
    );

router.post(
    '/additional-details/:productId',

    productController.getAdditionalProductDetails
);

////////////export router
module.exports = router;
