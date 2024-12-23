const express = require('express');

const authControllers = require('../controllers/authControllers');
const adminControllers = require('../controllers/adminControllers');

const router = express.Router();

router.get('/login', adminControllers.getAdminLogin);
router.get('/logout', adminControllers.logout);

router.use(authControllers.protect, authControllers.restrictTo('admin'));

router.get('/home', adminControllers.getAdminHomeDetails);

router.get('/vendors-management', adminControllers.getVendorManagemetnDetails);

router.get(
    '/vendors-management/verification-requests',
    adminControllers.getPendingVendorVerifications
);

router.get('/vendors-management/:vendorId', adminControllers.getAVendorDetails);

router.get(
    '/vendors-management/order-details/:vendorId/',
    adminControllers.getVendorOrderDetails
);

router.get(
    '/vendors-management/products/:vendorId/',
    adminControllers.getVendorProductList
);

router.get(
    '/vendors-management/products/details/:vendorId/:productId',
    adminControllers.getVendorProductDetails
);

router.get('/user-management', adminControllers.getUserLists);

router.get('/user-management/:userId', adminControllers.getUserDetails);

router.get('/reports-management', adminControllers.getAllReports);

router.get('/category-management', adminControllers.getAllCategories);

module.exports = router;
