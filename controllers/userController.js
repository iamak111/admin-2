/* eslint-disable array-callback-return */
const mongoose = require('mongoose');

const userModel = require('../models/userModel');
const factoryHandler = require('./factoryHandler');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const productModel = require('../models/productModel');
const cartModel = require('../models/cartModel');
const wishlistModel = require('../models/wishListModel');
const ordermodel = require('../models/orderModel');
const addressModel = require('../models/addressModel');
const categoryModel = require('../models/categorieModel');
const encryptID = require('../util/encryptID');
const appReportModel = require('../models/reportModel');

const filerDataFromRequest = (obj, ...allowedFields) => {
    const filterdData = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) filterdData[el] = obj[el];
    });
    return filterdData;
};

exports.updateUser = catchAsync(async (req, res, next) => {
    const filter =
        req.user.role === 'user'
            ? ['name', 'email', 'profile']
            : req.user.role === 'vendor' &&
              req.user.accountVerification !== 'accepted'
            ? [
                  'name',
                  'email',
                  'verifyDocuments',
                  'profile',
                  'shopPhone',
                  'shopAddress',
                  'shopImage',
                  'city',
                  'state',
                  'country',
                  'zipcode',
                  'GSTNumber',
                  'shopName',
                  'shopEmail'
              ]
            : req.user.role === 'vendor' &&
              req.user.accountVerification === 'accepted'
            ? ['name', 'profile']
            : [[]];
    const filterObject = filerDataFromRequest(req.body, ...filter);
    if (req.file) filterObject.photo = req.file.filename;
    if (!filterObject.email) delete filterObject.email;
    if (
        req.user.role === 'vendor' &&
        req.user.accountVerification !== 'accepted'
    ) {
        filterObject.accountVerification = 'requested';
    }
    const user = await userModel.findByIdAndUpdate(req.user._id, filterObject, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'Success'
    });
});

// controller for get all user.
exports.getAlluser = factoryHandler.getAll(userModel);
exports.getAllCart = factoryHandler.getAll(cartModel);

exports.getUser = catchAsync(async (req, res, next) => {
    return res.status(200).json({
        status: 'Success',
        docs: req.user
    });
});

exports.checkProductADo = catchAsync(async (req, res, next) => {
    const cart = await cartModel.findOne({
        user: req.user._id,
        product: req.params.productId
    });
    const checkProductType = await productModel.findById(req.body.product);
    req.body.productType = checkProductType.productType;

    if (checkProductType.productType === 'variable') {
        let dataChecker = {};
        if (req.body.data.selectedProductSize) {
            dataChecker = {
                $elemMatch: {
                    name: req.body.data.selectedProductSize
                }
            };
        } else {
            const checkValData = await variableModel.findOne({
                color: req.body.data.selectedProductColor,
                product: req.body.product
            });
            if (checkValData.availableSize[0].name) {
                return next(
                    new AppError(
                        'Something Went wrong.Please try again later',
                        400
                    )
                );
            }
            dataChecker = {
                $elemMatch: {
                    _id: mongoose.Types.ObjectId(req.body.data.dummyData)
                }
            };
        }
        if (req.body.data.selectedProductColor) {
            const checkVarProduct = await variableModel.findOne({
                color: req.body.data.selectedProductColor,
                product: req.body.product,
                availableSize: dataChecker
            });
            if (!checkVarProduct) {
                return next(
                    new AppError("can't find a document with this id", 404)
                );
            }
        }
    }

    req.body.quantity = req.body.data.quantity;

    if (!req.body.color)
        req.body.color = req.body.data.selectedProductColor || null;
    if (!req.body.size)
        req.body.size = req.body.data.selectedProductSize || null;
    if (cart) {
        const doc = await cartModel.findByIdAndUpdate(cart._id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return next(
                new AppError("can't find a document with this id", 404)
            );
        }

        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    } else {
        const doc = await cartModel.create(req.body);
        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    }
});

const getMyPerProduct = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.find({ user: req.user._id });

        if (!doc) {
            return next(new AppError('No Product available for you', 400));
        }
        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    });

exports.getuserId = async (req, res, next) => {
    req.body.userId = req.user._id;
    req.body.ecmaeId = await encryptID();
    next();
};
exports.addNewAddress = factoryHandler.createOne(addressModel);

exports.updateUserAddress = catchAsync(async (req, res, next) => {
    const address = await addressModel.findOneAndUpdate(
        {
            userId: req.user._id,
            ecmaeId: req.params.id
        },
        req.body,
        { runValidators: true }
    );

    if (!address) return next(new AppError('Address not found.', 404));
    return res.status(200).json({ status: 'Success' });
});

exports.deleteUserAddress = catchAsync(async (req, res, next) => {
    const address = await addressModel.findOneAndDelete({
        userId: req.user._id,
        ecmaeId: req.params.id
    });

    if (!address) return next(new AppError('Address not found!.', 404));

    return res.status(200).json({ status: 'Success' });
});

exports.checkTimeExpires = catchAsync(async (req, res, next) => {
    const checkEligibleTime = await userModel.findOne(req.user._id);
    if (checkEligibleTime.lastUpdate < new Date(Date.now())) {
        return next(
            new AppError('Your Time being expired. Please Try again...', 400)
        );
    }
    next();
});

exports.getCheckoutDetails = catchAsync(async (req, res, next) => {
    const filterQuery = {};
    if (req.from === 'web') {
        filterQuery.for = process.env.CATEGORYA;
    }
    const [addresses, productes] = await Promise.all([
        addressModel.find({ userId: req.user._id }),
        cartModel.aggregate([
            {
                $match: {
                    userId: req.user._id,
                    type: 'order',
                    ...filterQuery
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
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
            }
        ])
    ]);
    let price = 0,
        discountPrice = 0,
        finalPrice = 0;
    const products = await Promise.all(
        productes.map(async (el) => {
            switch (el.product.productType) {
                case 'single':
                    el = {
                        bannerImage: el.product.bannerImage,
                        name: el.product.name,
                        price: el.product.price,
                        discountPrice: el.product.discountPrice,
                        type: 'single',
                        quantity: el.quantity
                    };
                    price = price + el.price * el.quantity;
                    discountPrice =
                        discountPrice + el.discountPrice * el.quantity;
                    finalPrice =
                        (!!el.discountPrice * el.quantity
                            ? el.discountPrice * el.quantity
                            : el.price * el.quantity) + finalPrice;
                    return el;
                    break;
                case 'colorOnly':
                    if (!el.color)
                        return next(new AppError('Invalid product!', 400));
                    let color = false;
                    await Promise.all(
                        el.product.productDetails.map((els) => {
                            if (els.ecmpsId === el.color) {
                                color = els;
                            }
                        })
                    );
                    if (!color)
                        return next(new AppError('Invalid product!', 400));
                    el = {
                        bannerImage: color.bannerImage,
                        price: color.subDetails[0].price,
                        discountPrice: color.subDetails[0].discountPrice,
                        name: el.product.name,
                        color: color.color,
                        type: 'colorOnly',
                        quantity: el.quantity
                    };
                    price = price + color.subDetails[0].price * el.quantity;
                    discountPrice =
                        discountPrice +
                        color.subDetails[0].discountPrice * el.quantity;
                    finalPrice =
                        (!!color.subDetails[0].discountPrice * el.quantity
                            ? color.subDetails[0].discountPrice * el.quantity
                            : color.subDetails[0].price * el.quantity) +
                        finalPrice;
                    return el;
                    break;
                case 'sizeOnly':
                    if (!el.size)
                        return next(new AppError('Invalid product!', 400));
                    let size = false;
                    await Promise.all(
                        el.product.productDetails[0].subDetails.map((els) => {
                            if (els.ecmpssId === el.size) {
                                size = els;
                            }
                        })
                    );
                    if (!size)
                        return next(new AppError('Invalid product!', 400));
                    el = {
                        bannerImage: el.product.productDetails[0].bannerImage,
                        price: size.price,
                        discountPrice: size.discountPrice,
                        name: el.product.name,
                        size: size.size,
                        type: 'sizeOnly',
                        quantity: el.quantity
                    };
                    price = price + size.price * el.quantity;
                    discountPrice =
                        discountPrice + size.discountPrice * el.quantity;
                    finalPrice =
                        (!!size.discountPrice * el.quantity
                            ? size.discountPrice * el.quantity
                            : size.price * el.quantity) + finalPrice;
                    return el;

                    break;
                case 'colorWithSize':
                    if (!el.color || !el.size) {
                        return next(new AppError('Invalid product!', 400));
                    }
                    let cols = false,
                        sizs = false;
                    const colVals = {};
                    await Promise.all([
                        el.product.productDetails.map(async (els) => {
                            if (els.ecmpsId === el.color) {
                                cols = true;
                                await Promise.all(
                                    els.subDetails.map((els2) => {
                                        if (els2.ecmpssId === el.size)
                                            sizs = true;
                                        colVals.price = els2.price;
                                        colVals.size = els2.size;
                                        colVals.discountPrice =
                                            els2.discountPrice;
                                        colVals.bannerImage = els.bannerImage;
                                        colVals.imageGallery = els.imageGallery;
                                        colVals.color = els.color;
                                        colVals.name = el.product.name;
                                        colVals.quantity = el.quantity;
                                        colVals.type = 'colorWithSize';
                                    })
                                );
                            }
                        })
                    ]);
                    price = price + colVals.price * colVals.quantity;
                    discountPrice =
                        discountPrice +
                        colVals.discountPrice * colVals.quantity;
                    finalPrice =
                        (!!colVals.discountPrice * colVals.quantity
                            ? colVals.discountPrice * colVals.quantity
                            : colVals.price * colVals.quantity) + finalPrice;
                    if (!cols || !sizs) {
                        return next(new AppError('Invalid product!', 400));
                    }
                    return colVals;

                    break;
            }
        })
    );

    if (!products || !products.length)
        return next(new AppError(`undefiefd url ${req.originalUrl}`, 404));
    req.body = { addresses, products, price, discountPrice, finalPrice };

    return next();
});

// rendder offline
exports.sendCheckoutScreen = (req, res) =>
    res.render('checkout', { status: 'Success', docs: req.body });

// rendder offline
exports.sendConfirmScreen = (req, res) =>
    res.render('confirm', {
        status: 'Success',
        docs: req.body,
        address: req.params.addressId
    });

exports.thankYouGet = (req, res) => res.render('thankyou');
exports.getAccountRender = (req, res) =>
    res.render('account', { docs: req.body });

exports.getCarts = (req, res) =>
    res.render('cart', { docs: req.body, recommendedProduct: req.recom });
exports.getWishlistRender = (req, res) =>
    res.render('wishlist', { docs: req.body });

exports.getAccountDetails = catchAsync(async (req, res, next) => {
    const filterQuery = {};
    if (req.from === 'web') {
        filterQuery['productDetails.for'] = process.env.CATEGORYA;
    }

    const [address, orders] = await Promise.all([
        addressModel.find({ userId: req.user._id }),
        ordermodel
            .find({
                userId: req.user._id,
                ...filterQuery,
                'orderDetails.productOrderStatus': { $ne: 'canceled' }
            })
            .populate('productDetails.vendorId', 'name profile email')
            .sort({ createdAt: -1 })
    ]);
    req.body = { address, orders };
    return next();
});

// create report
exports.creeateNewReport = catchAsync(async (req, res, next) => {
    const report = await appReportModel.create({
        userId: req.user._id,
        userEId: req.user.ecmuId,
        title: req.body.title,
        description: req.body.description,
        ecmarId: await encryptID()
    });

    return res.status(200).json({ status: 'Success' });
});
