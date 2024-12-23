const express = require('express');

const viewController = require('../controllers/viewController');
const authControllers = require('../controllers/authControllers');
const userController = require('../controllers/userController');
const productController = require('../controllers/productControllers');

const router = express.Router();
router.use(authControllers.isLoggedin, viewController.getCategoires);
router
    .route('/')
    .get(
        viewController.top3SellingCategories,
        viewController.getTopCategories,
        viewController.getCategories,
        viewController.getHome
    );
router.route('/logout').get(viewController.logout);
router.route('/login').get(viewController.getLogin);

router.get('/shop', productController.getAllProduct);
router.get(
    '/shop/product/:slug',
    productController.getAProduct,
    productController.getRecommendedProducts,
    viewController.getAProduct
);

router.get(
    '/order/checkout',
    authControllers.protect,
    userController.getCheckoutDetails,
    userController.sendCheckoutScreen
);

router.get(
    '/order/confirm/:addressId',
    authControllers.protect,
    userController.getCheckoutDetails,
    userController.sendConfirmScreen
);

router.get('/thank-you', authControllers.protect, userController.thankYouGet);
router.get(
    '/cart',
    authControllers.protect,
    productController.myCarts,
    productController.getRecommendedProducts,
    userController.getCarts
);

router.get(
    '/wishlist',
    authControllers.protect,
    productController.getMyWishlist,
    userController.getWishlistRender
);

router.get(
    '/account',
    authControllers.protect,
    userController.getAccountDetails,
    userController.getAccountRender
);

module.exports = router;
