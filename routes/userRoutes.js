// import expess
const express = require('express');

// import user controller
const userController = require('../controllers/userController');
// import auth controller
const authController = require('../controllers/authControllers');
const viewController = require('../controllers/viewController');
const productControllers = require('../controllers/productControllers');

// set router
const router = express.Router();

// set routes
// router.route('/').get(authController.protect, userController.getAlluser);
router.post('/user-otp', authController.userOtpGenerate);
router.patch('/verify-user', authController.verifyUserOtp);
// router.route('/signUp').post(authController.signup);

// router.route('/login').post(authController.login);
// router
//     .route('/:id')
//     .get(
//         authController.protect,
//         userController.getUser
//     );

// // get user
// router.get('/get-me', authController.protect, userController.getUser);

// router
//     .route('/update-me')
//     .patch(authController.protect, userController.updateUser);

// router.patch(
//     '/vendor-verification-docs',
//     authController.protect,
//     authController.restrictTo('vendor'),
//     authController.verifyVendor,
//     vendorController.uploadVendorDetails
// );

module.exports = router;
