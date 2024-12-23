const express = require('express');

const reviewController = require('../controllers/reviewControllers');

// import auth controller
const authConroller = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router
    .route('/product/:orderId')
    .patch(authConroller.protect, reviewController.updateReview)
    .delete(authConroller.protect, reviewController.deleteReview);

module.exports = router;
