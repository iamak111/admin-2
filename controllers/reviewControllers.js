const reviewModel = require('../models/reviewModel');
const AppError = require('../util/appError');
const catchAsync = require('../util/catchAsync');
const factoryHandler = require('./factoryHandler');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const encryptID = require('../util/encryptID');

exports.updateReview = catchAsync(async (req, res, next) => {
    const order = await orderModel.findOne({
        ecmorId: req.params.orderId,
        userId: req.user._id
        // 'orderDetails.productOrderStatus': 'delivered'
    });

    if (!order)
        return next(
            new AppError(
                'Something went wrong while processing your request.',
                400
            )
        );

    const review = await reviewModel.updateOne(
        {
            productId: order.productDetails.productId,
            userId: req.user._id
        },
        {
            $set: {
                review: req.body.review,
                rating: req.body.rating,
                productId: order.productDetails.productId,
                productEId: order.productDetails.productEId,
                userId: req.user._id,
                ecmerId: await encryptID()
            }
        },
        {
            upsert: true,
            runValidators: true
        }
    );

    const stats = await reviewModel.aggregate([
        {
            $match: {
                productId: order.productDetails.productId
            }
        },
        {
            $group: {
                _id: '$productId',
                length: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await productModel.findByIdAndUpdate(order.productDetails.productId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].length
        });
    } else {
        await productModel.findByIdAndUpdate(order.productDetails.productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0
        });
    }
    return res.status(200).json({ status: 'Success' });
});
exports.checkValidUser = catchAsync(async (req, res, next) => {
    const valProduct = await productModel.findById(req.params.productId);
    const validUser = await orderModel.findOne({
        'userDeatils.email': req.user.email,
        'orderDetails.productOrderStatus': 'delivered',
        'productDetails.product': valProduct.name
    });
    if (!validUser) {
        return next(
            new AppError(
                "You don't have the permission to review this product",
                400
            )
        );
    }
    next();
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    await reviewModel.findOneAndDelete({
        ecmerId: req.params.orderId,
        userId: req.user._id
    });
    return res.status(200).json({ status: 'Success' });
});
