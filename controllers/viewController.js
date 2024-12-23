/* eslint-disable prefer-template */
/* eslint-disable arrow-body-style */
/* eslint-disable no-else-return */
/* eslint-disable array-callback-return */
const mongoose = require('mongoose');
const cartModel = require('../models/cartModel');
const wishlistModel = require('../models/wishListModel');
const catchAsync = require('../util/catchAsync');
const productModel = require('../models/productModel');
const categorieModel = require('../models/categorieModel');
const ApiFeature = require('../util/apiFeatures');
const AppError = require('../util/appError');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const ordermodel = require('../models/orderModel');
const addressModel = require('../models/addressModel');
const { banners1, banners2 } = require('../bannerJSON/bannerjson.json');
exports.getHome = (req, res) => {
    // console.log(JSON.stringify(req.body));
    return res.status(200).render('home', {
        docs: req.body,
        title: 'Themobsterhoard - Ecommerce Service'
    });
};

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'Themobsterhoard - Signin your account'
    });
};

exports.isAlreadyLogin = (req, res, next) => {
    // if (req.cookies.jwt) return res.status(200).redirect('/');
    next();
};

exports.getAddress2 = catchAsync(async (req, res, next) => {
    const docs = await addressModel.find({ userId: req.user._id });
    req.docs = docs;
    next();
});

exports.myAddress = (req, res) => {
    res.status(200).json({
        status: 'Success',
        docs: req.docs
    });
};

exports.sendBodyDocs = (req, res) =>
    res.status(200).json({ status: 'Success', docs: req.body });

exports.getCategoires = catchAsync(async (req, res, next) => {
    const category = await categorieModel.find({ for: process.env.CATEGORYA });
    res.locals.category = category;

    next();
});
exports.logout = catchAsync((req, res, next) => {
    res.cookie('jwt', 'loggout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    return res.redirect('/');
});

exports.top3SellingCategories = catchAsync(async (req, res, next) => {
    let filterQuery = {};
    if (req.from !== 'mobile') {
        filterQuery = { 'productDetails.for': process.env.CATEGORYA };
    }
    const categories = await orderModel.aggregate([
        {
            $match: filterQuery
        },
        {
            $group: {
                _id: '$productDetails.categorie',
                product: { $sum: 1 }
            }
        },
        {
            $addFields: {
                category: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                product: -1
            }
        },
        {
            $limit: 8
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: 'name',
                as: 'categorie'
            }
        },
        {
            $unwind: '$categorie'
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [{ product: '$product' }, '$categorie']
                }
            }
        }
    ]);
    req.body.top3Categories = categories;

    return next();
});

exports.getTopCategories = catchAsync(async (req, res, next) => {
    let filterQuery = [];
    let fors = [];
    if (req.from !== 'mobile') {
        filterQuery = { 'productDetails.for': process.env.CATEGORYA };
        fors = { for: process.env.CATEGORYA };
    }
    const products = await orderModel.aggregate([
        {
            $match: { ...filterQuery }
        },
        {
            $group: {
                _id: '$productDetails.productId',
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 5
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                pipeline: [
                    {
                        $match: { verified: true }
                    }
                ],
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [{ count: '$count' }, '$product']
                }
            }
        }
    ]);

    req.body.topSetllingProducts = products;

    let dealOfTheDay = await productModel
        .find({
            ...fors,
            verified: true,
            dealOfTheDay: true,
            dealOfTheDayExpires: { $gt: Date.now() }
        })
        .sort({ dealOfTheDayStartsAt: -1 })
        .limit(8);

    let topDeals = await productModel.aggregate([
        {
            $match: {
                ...fors,
                verified: true,
                dealOfTheDay: true,
                dealOfTheDayExpires: { $gt: new Date() }
            }
        },
        {
            $project: {
                price: 1,
                discountPrice: 1,
                percentageDiscount: {
                    $cond: {
                        if: { $gt: ['$discountPrice', 0] },
                        then: {
                            $multiply: [
                                {
                                    $divide: [
                                        {
                                            $subtract: [
                                                '$price',
                                                '$discountPrice'
                                            ]
                                        },
                                        '$price'
                                    ]
                                },
                                100
                            ]
                        },
                        else: 0
                    }
                },
                bannerImage: 1,
                description: 1,
                name: 1,
                ratingsAverage: 1,
                slug: 1,
                id: '$ecmpeId'
            }
        },
        {
            $sort: { percentageDiscount: -1 }
        },
        {
            $limit: 1
        }
    ]);

    const recommendedProduct = await productModel.aggregate([
        { $match: { ...fors } },
        { $sample: { size: 8 } }
    ]);

    if (topDeals.length !== 8) {
        const len = 8 - topDeals.length;
        const a = await productModel.aggregate([
            { $match: { ...fors } },
            { $sample: { size: len } }
        ]);
        topDeals = [...topDeals, ...a];
    }

    if (dealOfTheDay.length !== 8) {
        const len = 8 - dealOfTheDay.length;
        const b = await productModel.aggregate([
            { $match: { ...fors } },
            { $sample: { size: len } }
        ]);

        dealOfTheDay = [...dealOfTheDay, ...b];
    }

    req.body.topDeals = topDeals;
    req.body.dealOfTheDay = dealOfTheDay;
    req.body.recommendedProduct = recommendedProduct;
    req.body.bannerjson1 = banners1;
    req.body.bannerjson2 = banners2;
    return next();
});

exports.getCategories = catchAsync(async (req, res, next) => {
    // const categories = await categorieModel.find({ for: 'themobsterhoard' });
    // req.body.categories = categories;
    return next();
});

// get a product
exports.getAProduct = (req, res, next) =>
    res.render('productDetails', {
        doc: req.body,
        recommendedProduct: req.recom
    });
