/* eslint-disable  */
const multer = require('multer');

const productModel = require('../models/productModel');
const categoryModel = require('../models/categorieModel');
const cartModel = require('../models/cartModel');
const factoryHandler = require('./factoryHandler');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
let mongoose = require('mongoose');
const ordermodel = require('../models/orderModel');
const wishlistModel = require('../models/wishListModel');
const categorieModel = require('../models/categorieModel');
const ApiFeature = require('../util/apiFeatures');
const slugify = require('slugify');
const encryptID = require('../util/encryptID');
const addressModel = require('../models/addressModel');

// controller for get all product.

// ============================================================
// get  a product

// ============================================================
// update a product

exports.assignValues = catchAsync(async (req, res, next) => {
    let getVarProduct;
    await Promise.all(
        req.body.map(async (el) => {
            const checkProduct = await variableModel.findOne({
                product: el.product,
                color: el.color
            });

            if (
                el.availableSize.price * 1 <=
                el.availableSize.discountPrice * 1
            ) {
                return next(
                    new AppError(
                        'Discount price must be lesser then price',
                        400
                    )
                );
            }
            if (!checkProduct) {
            } else if (!checkProduct.availableSize[0]) {
            } else if (!checkProduct.availableSize[0].name) {
                await variableModel.updateOne(
                    {
                        product: el.product,
                        color: el.color
                    },
                    {
                        $set: {
                            product: el.product,
                            color: el.color,
                            availableSize: []
                        }
                    },
                    { upsert: true }
                );
            }

            if (el.availableSize.name) {
                await variableModel.updateOne(
                    {
                        product: el.product,
                        color: el.color
                    },
                    {
                        $pull: {
                            availableSize: {
                                name: el.availableSize.name
                            }
                        }
                    }
                );
                getVarProduct = await variableModel.updateOne(
                    {
                        product: el.product,
                        color: el.color
                    },
                    {
                        $set: {
                            product: el.product,
                            color: el.color
                        },
                        $push: {
                            availableSize: {
                                name: el.availableSize.name,
                                coverImage: el.availableSize.coverImage,
                                price: el.availableSize.price,
                                discountPrice: el.availableSize.discountPrice,
                                imageGallery: el.availableSize.imageGallery
                            }
                        }
                    },
                    { upsert: true }
                );
            } else {
                getVarProduct = await variableModel.updateOne(
                    {
                        product: el.product,
                        color: el.color
                    },
                    {
                        $set: {
                            product: el.product,
                            color: el.color,
                            availableSize: [
                                {
                                    price: el.availableSize.price,
                                    discountPrice:
                                        el.availableSize.discountPrice,
                                    coverImage: el.availableSize.coverImage,
                                    imageGallery: el.availableSize.imageGallery
                                }
                            ]
                        }
                    },
                    { upsert: true }
                );
            }
        })
    );
    return res.status(200).json({
        status: 'Success',
        message: 'Your product created successfully',
        data: getVarProduct
    });
});

// assign data for craete new prouduct
exports.assignDataForCreateNewProduct = catchAsync(async (req, res, next) => {
    if (!req.body.productType)
        return next(
            new AppError('Something went wrong!! please try again..', 400)
        );

    if (!req.body.description)
        return next(new AppError('Description should be included.', 400));

    if (!req.body.categorie)
        return next(new AppError('Category should be incluced.', 400));

    const categorie = await categorieModel.findOne({
        ecmcId: req.body.categorie
    });
    const deal = {};
    if (req.body.dealOfTheDay) {
        deal.dealOfTheDay = true;
        deal.dealOfTheDayStartsAt = Date.now();
        deal.dealOfTheDayExpires = new Date(
            new Date().setHours(23, 59, 59, 999)
        );
    } else {
        deal.dealOfTheDay = false;
    }
    if (!categorie) return next(new AppError('Categorie not found.', 400));
    if (!req.body.features || !req.body.features?.length)
        return next(
            new AppError('Atleast one features should be inclded.', 400)
        );
    switch (req.body.productType) {
        case 'single':
            if (req.body.discountPrice)
                if (req.body.discountPrice * 1 >= req.body.price * 1) {
                    return next(
                        new AppError(
                            'Discount price should be less then price.',
                            400
                        )
                    );
                }

            if (!req.body.bannerImage)
                return next(
                    new AppError('Banner image should be included.', 400)
                );

            if (!req.body.imageGallery || !req.body.imageGallery?.length)
                req.body.imageGallery = [req.body.bannerImage];

            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice ?? 0,
                vendorId: req.user._id,
                vendorEId: req.user.ecmuId,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'single',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                ecmpeId: await encryptID(),
                features: req.body.features,
                specification: req.body.specification,
                ...deal
            };
            next();
            break;
        case 'colorOnly':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));

            let productDetails = await Promise.all(
                req.body.productDetails.map(async (el, index) => {
                    if (el.subDetails[0].discountPrice * 1)
                        if (
                            el.subDetails[0].discountPrice * 1 >=
                            el.subDetails[0].price * 1
                        ) {
                            return next(
                                new AppError(
                                    'Discount price should be less then price.',
                                    400
                                )
                            );
                        }

                    if (!el.bannerImage)
                        return next(
                            new AppError(
                                'Banner image should be included.',
                                400
                            )
                        );

                    if (!el.imageGallery || !el.imageGallery?.length)
                        el.imageGallery = [el.bannerImage];

                    if (!el.color)
                        return next(
                            new AppError('Color name should be included.', 400)
                        );
                    el = {
                        bannerImage: el.bannerImage,
                        imageGallery: el.imageGallery,
                        color: el.color,
                        subDetails: [
                            {
                                price: el.subDetails[0].price,
                                discountPrice:
                                    el.subDetails[0].discountPrice ?? 0,
                                ecmpssId: await encryptID()
                            }
                        ],
                        ecmpsId: await encryptID()
                    };
                    if (index === 0) {
                        req.body.price = el.subDetails[0].price;
                        req.body.discountPrice = el.subDetails[0].discountPrice;
                        req.body.bannerImage = el.bannerImage;
                        req.body.imageGallery = el.imageGallery;
                    }
                    return el;
                })
            );

            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice,
                vendorId: req.user._id,
                vendorEId: req.user.ecmuId,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'colorOnly',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                ecmpeId: await encryptID(),
                productDetails,
                features: req.body.features,
                specification: req.body.specification,
                ...deal
            };
            next();
            break;
        case 'sizeOnly':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));

            const subDetails = await Promise.all(
                req.body.productDetails[0].subDetails.map(async (el, index) => {
                    if (!el.size)
                        return next(
                            new AppError('Size should be included.', 400)
                        );
                    if (el.discountPrice)
                        if (el.discountPrice * 1 >= el.price * 1) {
                            return next(
                                new AppError(
                                    'Discount price should be less then price.',
                                    400
                                )
                            );
                        }

                    el = {
                        price: el.price,
                        discountPrice: el.discountPrice ?? 0,
                        size: el.size,
                        ecmpssId: await encryptID()
                    };

                    if (index === 0) {
                        req.body.price = el.price;
                        req.body.discountPrice = el.discountPrice;
                    }
                    return el;
                })
            );

            if (!req.body.productDetails[0].bannerImage)
                return next(
                    new AppError('Banner image should be included.', 400)
                );

            if (
                !req.body.productDetails[0].imageGallery ||
                !req.body.productDetails[0].imageGallery?.length
            )
                req.body.productDetails[0].imageGallery = [
                    req.body.productDetails[0].bannerImage
                ];
            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice,
                vendorId: req.user._id,
                vendorEId: req.user.ecmuId,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'sizeOnly',
                bannerImage: req.body.productDetails[0].bannerImage,
                imageGallery: req.body.productDetails[0].imageGallery,
                verified: true,
                ecmpeId: await encryptID(),
                productDetails: [
                    {
                        bannerImage: req.body.productDetails[0].bannerImage,
                        imageGallery: req.body.productDetails[0].imageGallery,
                        ecmpsId: await encryptID(),
                        subDetails
                    }
                ],
                features: req.body.features,
                specification: req.body.specification,
                ...deal
            };
            return next();
            break;
        case 'colorWithSize':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));
            let colorWithSizeProuct = await Promise.all(
                req.body.productDetails.map(async (el, index) => {
                    const subDetails = await Promise.all(
                        el.subDetails.map(async (els, index2) => {
                            if (!els.size)
                                return next(
                                    new AppError(
                                        'Size should be included.',
                                        400
                                    )
                                );
                            if (els.discountPrice)
                                if (els.discountPrice * 1 >= els.price * 1) {
                                    return next(
                                        new AppError(
                                            'Discount price should be less then price.',
                                            400
                                        )
                                    );
                                }

                            els = {
                                price: els.price,
                                discountPrice: els.discountPrice ?? 0,
                                size: els.size,
                                ecmpssId: await encryptID()
                            };

                            if (index2 === 0) {
                                req.body.price = els.price;
                                req.body.discountPrice = els.discountPrice;
                            }
                            return els;
                        })
                    );
                    if (!el.bannerImage)
                        return next(
                            new AppError(
                                'Banner image should be included.',
                                400
                            )
                        );

                    if (!el.imageGallery || !el.imageGallery?.length)
                        el.imageGallery = [el.bannerImage];
                    if (!el.color)
                        return next(
                            new AppError('Color name should be included.', 400)
                        );
                    el = {
                        bannerImage: el.bannerImage,
                        imageGallery: el.imageGallery,
                        color: el.color,
                        subDetails,
                        ecmpsId: await encryptID()
                    };
                    if (index === 0) {
                        req.body.bannerImage = el.bannerImage;
                        req.body.imageGallery = el.imageGallery;
                    }
                    return el;
                })
            );
            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice ?? 0,
                vendorId: req.user._id,
                vendorEId: req.user.ecmuId,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'colorWithSize',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                ecmpeId: await encryptID(),
                productDetails: colorWithSizeProuct,
                features: req.body.features,
                specification: req.body.specification,
                ...deal
            };
            next();
            break;
    }
});

// assign data for craete new prouduct
exports.assignDataForUpdateNewProduct = catchAsync(async (req, res, next) => {
    if (!req.body.productType)
        return next(
            new AppError('Something went wrong!! please try again..', 400)
        );

    if (!req.body.description)
        return next(new AppError('Description should be included.', 400));

    if (!req.body.categorie)
        return next(new AppError('Category should be incluced.', 400));

    const categorie = await categorieModel.findOne({
        ecmcId: req.body.categorie
    });

    if (!categorie) return next(new AppError('Categorie not found.', 400));

    req.searchQuery = {
        vendorId: req.user._id,
        ecmpeId: req.params.productId
    };
    const deal = {};
    if (req.body.dealOfTheDay) {
        deal.dealOfTheDay = true;
        deal.dealOfTheDayStartsAt = Date.now();
        deal.dealOfTheDayExpires = new Date(
            new Date().setHours(23, 59, 59, 999)
        );
    } else {
        deal.dealOfTheDay = false;
    }

    switch (req.body.productType) {
        case 'single':
            if (req.body.discountPrice)
                if (req.body.discountPrice * 1 >= req.body.price * 1) {
                    console.log(req.body.discountPrice, req.body.price);
                    return next(
                        new AppError(
                            'Discount price should be less then price.',
                            400
                        )
                    );
                }

            if (!req.body.bannerImage)
                return next(
                    new AppError('Banner image should be included.', 400)
                );

            if (!req.body.imageGallery || !req.body.imageGallery?.length)
                req.body.imageGallery = [req.body.bannerImage];

            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice ?? 0,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'single',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                specification: req.body.specification,
                features: req.body.features,
                ...deal
            };

            next();
            break;
        case 'colorOnly':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));

            let productDetails = await Promise.all(
                req.body.productDetails.map(async (el, index) => {
                    if (el.subDetails[0].discountPrice)
                        if (
                            el.subDetails[0].discountPrice * 1 >=
                            el.subDetails[0].price * 1
                        ) {
                            return next(
                                new AppError(
                                    'Discount price should be less then price.',
                                    400
                                )
                            );
                        }

                    if (!el.bannerImage)
                        return next(
                            new AppError(
                                'Banner image should be included.',
                                400
                            )
                        );

                    if (!el.imageGallery || !el.imageGallery?.length)
                        el.imageGallery = [el.bannerImage];
                    if (!el.color)
                        return next(
                            new AppError('Color name should be included.', 400)
                        );
                    el = {
                        bannerImage: el.bannerImage,
                        imageGallery: el.imageGallery,
                        color: el.color,
                        subDetails: [
                            {
                                price: el.subDetails[0].price,
                                discountPrice:
                                    el.subDetails[0].discountPrice ?? 0,
                                ecmpssId:
                                    el.subDetails[0].id ?? (await encryptID())
                            }
                        ],
                        ecmpsId: el.id ?? (await encryptID())
                    };
                    if (index === 0) {
                        req.body.price = el.subDetails[0].price;
                        req.body.discountPrice = el.subDetails[0].discountPrice;
                        req.body.bannerImage = el.bannerImage;
                        req.body.imageGallery = el.imageGallery;
                    }
                    return el;
                })
            );

            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'colorOnly',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                productDetails,
                specification: req.body.specification,
                features: req.body.features,
                ...deal
            };
            next();
            break;
        case 'sizeOnly':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));

            const subDetails = await Promise.all(
                req.body.productDetails[0].subDetails.map(async (el, index) => {
                    if (!el.size)
                        return next(
                            new AppError('Size should be included.', 400)
                        );
                    if (el.discountPrice)
                        if (el.discountPrice * 1 >= el.price * 1) {
                            return next(
                                new AppError(
                                    'Discount price should be less then price.',
                                    400
                                )
                            );
                        }

                    el = {
                        size: el.size,
                        price: el.price,
                        discountPrice: el.discountPrice ?? 0,
                        ecmpssId: el.id ?? (await encryptID())
                    };

                    if (index === 0) {
                        req.body.price = el.price;
                        req.body.discountPrice = el.discountPrice;
                    }
                    return el;
                })
            );

            if (!req.body.productDetails[0].bannerImage)
                return next(
                    new AppError('Banner image should be included.', 400)
                );

            if (
                !req.body.productDetails[0].imageGallery ||
                !req.body.productDetails[0].imageGallery?.length
            )
                req.body.productDetails[0].imageGallery = [
                    req.body.productDetails[0].bannerImage
                ];
            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'sizeOnly',
                bannerImage: req.body.productDetails[0].bannerImage,
                imageGallery: req.body.productDetails[0].imageGallery,
                verified: true,
                productDetails: [
                    {
                        bannerImage: req.body.productDetails[0].bannerImage,
                        imageGallery: req.body.productDetails[0].imageGallery,
                        ecmpsId:
                            req.body.productDetails[0].id ??
                            (await encryptID()),
                        subDetails
                    }
                ],
                specification: req.body.specification,
                features: req.body.features,
                ...deal
            };
            return next();
            break;
        case 'colorWithSize':
            if (!req.body.productDetails || !req.body.productDetails?.length)
                return next(new AppError('Please fill valid datas.', 400));
            let colorWithSizeProuct = await Promise.all(
                req.body.productDetails.map(async (el, index) => {
                    const subDetails = await Promise.all(
                        el.subDetails.map(async (els, index2) => {
                            if (!els.size)
                                return next(
                                    new AppError(
                                        'Size should be included.',
                                        400
                                    )
                                );
                            if (els.discountPrice)
                                if (els.discountPrice * 1 >= els.price * 1) {
                                    return next(
                                        new AppError(
                                            'Discount price should be less then price.',
                                            400
                                        )
                                    );
                                }

                            els = {
                                size: els.size,
                                price: els.price,
                                discountPrice: els.discountPrice ?? 0,
                                ecmpssId: els.id ?? (await encryptID())
                            };

                            if (index2 === 0) {
                                req.body.price = els.price;
                                req.body.discountPrice = els.discountPrice;
                            }
                            return els;
                        })
                    );
                    if (!el.bannerImage)
                        return next(
                            new AppError(
                                'Banner image should be included.',
                                400
                            )
                        );

                    if (!el.imageGallery || !el.imageGallery?.length)
                        el.imageGallery = [el.bannerImage];
                    if (!el.color)
                        return next(
                            new AppError('Color name should be included.', 400)
                        );
                    el = {
                        bannerImage: el.bannerImage,
                        imageGallery: el.imageGallery,
                        color: el.color,
                        subDetails,
                        ecmpsId: el.id ?? (await encryptID())
                    };
                    if (index === 0) {
                        req.body.bannerImage = el.bannerImage;
                        req.body.imageGallery = el.imageGallery;
                    }
                    return el;
                })
            );
            req.body = {
                name: req.body.name,
                price: req.body.price,
                discountPrice: req.body.discountPrice ?? 0,
                slug: slugify(req.body.name, { lower: true }),
                categorie: categorie.name,
                for: categorie.for,
                description: req.body.description,
                productType: 'colorWithSize',
                bannerImage: req.body.bannerImage,
                imageGallery: req.body.imageGallery,
                verified: true,
                productDetails: colorWithSizeProuct,
                specification: req.body.specification,
                features: req.body.features,
                ...deal
            };

            next();
            break;
    }
});

// controller for create new product.
exports.createProduct = factoryHandler.createOne(productModel);

exports.updateProduct = factoryHandler.findOneAndUpdate(productModel);

// delet product
exports.deleteProudct = catchAsync(async (req, res, next) => {
    const data = await productModel.findOneAndDelete({
        ecmpeId: req.params.productId,
        vendorId: req.user._id
    });

    if (!data) return next(new AppError('Product not found.', 400));

    await Promise.all([
        cartModel.deleteMany({ productEId: req.params.productId }),
        wishlistModel.deleteMany({ productId: data._id })
    ]);
    return res.status(200).json({ status: 'Success' });
});

// assing get all product
exports.getAllProduct = catchAsync(async (req, res, next) => {
    let filterQuery = {};

    if (req.query.search) filterQuery.$text = { $search: req.query.search };
    if (req.from === 'web') {
        filterQuery.for = process.env.CATEGORYA;
    }
    filterQuery.verified = true;

    if (!!req.query.category) {
        filterQuery.categorie = { $in: req.query.category.split(',') };
    }

    if (req.query.max * 1) {
        filterQuery.$and = [
            {
                $or: [
                    {
                        discountPrice: {
                            $ne: 0,
                            $gte: req.query.min * 1 ? req.query.min * 1 : 0
                        }
                    },
                    {
                        discountPrice: 0,
                        price: {
                            $gte: req.query.min * 1 ? req.query.min * 1 : 0
                        }
                    }
                ]
            },
            {
                $or: [
                    {
                        discountPrice: {
                            $ne: 0,
                            $lte: req.query.max * 1 ? req.query.max * 1 : 0
                        }
                    },
                    {
                        discountPrice: 0,
                        price: {
                            $lte: req.query.max * 1 ? req.query.max * 1 : 0
                        }
                    }
                ]
            }
        ];
    } else
        filterQuery.$or = [
            {
                discountPrice: {
                    $ne: 0,
                    $gte: req.query.min * 1 ? req.query.min * 1 : 0
                }
            },
            {
                discountPrice: 0,
                price: {
                    $gte: req.query.min * 1 ? req.query.min * 1 : 0
                }
            }
        ];

    let sort = { createdAt: -1 };
    if (req.query.sort) {
        if (req.query.sort === 'low') {
            sort = {
                sortingField: 1
            };
        } else if (req.query.sort === 'high') {
            sort = {
                sortingField: -1
            };
        }
    }

    if (req.query.size) {
        const exp = req.query.size.split(',').map((el) => new RegExp(el, 'i'));
        filterQuery['productDetails.subDetails.size'] = {
            $in: exp
        };
    }
    if (req.query.color) {
        const exp = req.query.color.split(',').map((el) => new RegExp(el, 'i'));
        filterQuery['productDetails.color'] = {
            $in: exp
        };
    }

    if (req.query.rating) {
        filterQuery.ratingsAverage = {
            $in: req.query.rating.split(',').map((el) => el * 1)
        };
    }

    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    let [docs, [size], [color]] = await Promise.all([
        productModel.aggregate([
            {
                $match: filterQuery
            },
            {
                $addFields: {
                    sortingField: {
                        $cond: {
                            if: { $eq: ['$discountPrice', 0] },
                            then: '$price',
                            else: '$discountPrice'
                        }
                    }
                }
            },
            {
                $sort: sort
            },
            {
                $skip: ((!!pgno ? pgno : 1) - 1) * 25
            },
            { $limit: 25 }
        ]),

        productModel.aggregate([
            {
                $match: filterQuery
            },
            {
                $project: {
                    _id: 0,
                    name: '$productDetails.subDetails.size'
                }
            },
            {
                $unwind: '$name'
            },
            {
                $unwind: '$name'
            },
            {
                $match: {
                    name: { $ne: 'not-defined' }
                }
            },
            {
                $group: {
                    _id: null,
                    size: {
                        $addToSet: {
                            $toUpper: '$name'
                        }
                    }
                }
            }
        ]),
        productModel.aggregate([
            {
                $match: filterQuery
            },
            {
                $project: {
                    _id: 0,
                    color: '$productDetails.color'
                }
            },
            {
                $unwind: '$color'
            },
            {
                $unwind: '$color'
            },
            {
                $group: {
                    _id: null,
                    color: {
                        $addToSet: '$color'
                    }
                }
            },
            {
                $sort: { color: 1 }
            }
        ])
    ]);
    size = !size ? [] : size.size;
    color = !color ? [] : color.color;

    if (req.from === 'mobile') {
        const cate = await categorieModel.find();
        return res.status(200).json({
            status: 'Success',
            docs,
            size,
            color,
            categories: cate
        });
    } else
        return res.render('shop', {
            docs,
            size,
            color,
            url: req.protocol + '://' + req.get('host') + req.originalUrl
        });
});

// assign data for get a product
exports.getAProduct = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];
    const product = await productModel
        .findOne({
            slug: req.params.productId ?? req.params.slug,
            verified: true,
            ...filterQur
        })
        .populate('reviews');

    if (!product) return next(new AppError('Product not found!.', 404));

    req.body = product;
    return next();
});

// get recommnder product
exports.getRecommendedProducts = catchAsync(async (req, res, next) => {
    let fors = [];
    if (req.from !== 'mobile') {
        filterQuery = { 'productDetails.for': process.env.CATEGORYA };
        fors = { for: process.env.CATEGORYA };
    }
    const recommendedProduct = await productModel.aggregate([
        { $match: { ...fors } },
        { $sample: { size: 8 } }
    ]);

    req.recom = recommendedProduct;
    return next();
});

exports.sendRecommendedProducts = (req, res) => {
    return res.status(200).json({
        status: 'Success',
        docs: req.recom
    });
};
// send jsong
exports.sendAProduct = (req, res) => {
    return res.status(200).json({
        status: 'Success',
        docs: req.body
    });
};

// order products
exports.assignOrderProducts = catchAsync(async (req, res, next) => {
    if (!req.body?.length)
        return next(new AppError('Please select the product.', 400));

    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];

    const cart = await Promise.all(
        req.body.map(async (el) => {
            const product = await productModel.findOne({
                ecmpeId: el.id,
                verified: true,
                ...filterQur
            });
            if (!product) return next(new AppError('Product not found.', 404));

            if (!el.quantity)
                return next(new AppError('Please select the quantity.', 400));

            switch (product.productType) {
                case 'single':
                    const obj = {
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        for: product.for,
                        productId: product._id,
                        productEId: product.ecmpeId,
                        quantity: el.quantity,
                        ecmcmID: await encryptID(),
                        productType: product.productType,
                        type: 'order'
                    };
                    return obj;
                    break;
                case 'colorOnly':
                    if (!el.color)
                        return next(
                            new AppError('Please select the color.', 400)
                        );
                    const [colors] = await Promise.all([
                        product.productDetails.find(
                            (els) => els.ecmpsId === el.color
                        )
                    ]);

                    if (!colors)
                        return next(new AppError('Color not found.', 400));

                    const objCol = {
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        for: product.for,
                        productId: product._id,
                        productEId: product.ecmpeId,
                        quantity: el.quantity,
                        ecmcmID: await encryptID(),
                        productType: product.productType,
                        type: 'order',
                        color: el.color
                    };
                    return objCol;
                    break;
                case 'sizeOnly':
                    if (!el.size)
                        return next(
                            new AppError('Please select the size.', 400)
                        );

                    const [sizes] = await Promise.all([
                        product.productDetails[0].subDetails.find(
                            (els) => els.ecmpssId === el.size
                        )
                    ]);

                    if (!sizes)
                        return next(new AppError('Color not found.', 400));

                    const objsiz = {
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        for: product.for,
                        productId: product._id,
                        productEId: product.ecmpeId,
                        quantity: el.quantity,
                        ecmcmID: await encryptID(),
                        productType: product.productType,
                        type: 'order',
                        size: el.size
                    };
                    return objsiz;
                    break;
                case 'colorWithSize':
                    if (!el.size)
                        return next(
                            new AppError('Please select the size.', 400)
                        );
                    if (!el.color)
                        return next(
                            new AppError('Please select the color.', 400)
                        );
                    let color = false,
                        size = false;
                    await Promise.all([
                        product.productDetails.map(async (els) => {
                            if (els.ecmpsId === el.color) {
                                color = true;
                                await Promise.all(
                                    els.subDetails.map((els2) => {
                                        if (els2.ecmpssId === el.size)
                                            size = true;
                                    })
                                );
                            }
                        })
                    ]);

                    if (!color)
                        return next(new AppError('Color not found.', 400));

                    if (!size)
                        return next(new AppError('Size not found.', 400));

                    const objColsiz = {
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        for: product.for,
                        productId: product._id,
                        productEId: product.ecmpeId,
                        quantity: el.quantity,
                        ecmcmID: await encryptID(),
                        productType: product.productType,
                        type: 'order',
                        size: el.size,
                        color: el.color
                    };
                    return objColsiz;
                    break;
            }
        })
    );

    await cartModel.deleteMany({
        userId: req.user._id,
        type: 'order'
    });

    await cartModel.create(cart);

    return res.status(200).json({ status: 'Success' });
});

// order product
exports.orderProduct = catchAsync(async (req, res, next) => {
    const address = await addressModel.findOne({
        ecmaeId: req.params.addressId,
        userId: req.user._id
    });

    if (!address) return next(new AppError('Address not found.', 400));

    const badge = await encryptID();

    const carts = await cartModel.aggregate([
        {
            $match: {
                userId: req.user._id,
                type: 'order'
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                pipeline: [
                    {
                        $match: {
                            verified: true
                        }
                    }
                ],
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        }
    ]);

    if (!carts.length)
        return next(new AppError('Please select the product firts.', 400));

    const order = await Promise.all(
        carts.map(async (el) => {
            switch (el.product.productType) {
                case 'single':
                    el = {
                        userAddress: address,
                        productDetails: {
                            productId: el.product._id,
                            name: el.product.name,
                            description: el.product.description,
                            categorie: el.product.categorie,
                            vendorId: el.product.vendorId,
                            vendorEId: el.product.vendorEId,
                            productEId: el.product.ecmpeId,
                            productType: el.product.productType,
                            price: el.product.price,
                            discountPrice: el.product.discountPrice,
                            quantity: el.quantity,
                            for: el.product.for,
                            bannerImage: el.product.bannerImage,
                            imageGallery: el.product.imageGallery
                        },
                        orderDetails: {
                            paymentStatus: 'COD'
                        },
                        ecmorId: await encryptID(),
                        badge,
                        userId: req.user._id,
                        userEId: req.user.ecmuId
                    };
                    return el;
                    break;
                case 'colorOnly':
                    if (!el.color) {
                        return next(
                            new AppError(
                                `Something went wrong with product ${el.produc.name}.`
                            )
                        );
                    }
                    let col = false;
                    const colOn = {};
                    await Promise.all(
                        el.product.productDetails.map((els) => {
                            if (els.ecmpsId === el.color) {
                                col = true;
                                colOn.bannerImage = els.bannerImage;
                                colOn.imageGallery = els.imageGallery;
                                colOn.price = els.subDetails[0].price;
                                colOn.discountPrice =
                                    els.subDetails[0].discountPrice;
                                colOn.color = els.color;
                            }
                        })
                    );
                    if (!col)
                        return next(new AppError('Product not found.', 400));
                    el = {
                        userAddress: address,
                        productDetails: {
                            productId: el.product._id,
                            name: el.product.name,
                            description: el.product.description,
                            categorie: el.product.categorie,
                            vendorId: el.product.vendorId,
                            vendorEId: el.product.vendorEId,
                            productEId: el.product.ecmpeId,
                            productType: el.product.productType,
                            price: colOn.price,
                            discountPrice: colOn.discountPrice,
                            quantity: el.quantity,
                            for: el.product.for,
                            bannerImage: colOn.bannerImage,
                            imageGallery: colOn.imageGallery,
                            color: colOn.color
                        },
                        orderDetails: {
                            paymentStatus: 'COD'
                        },
                        ecmorId: await encryptID(),
                        badge,
                        userId: req.user._id,
                        userEId: req.user.ecmuId
                    };
                    return el;
                    break;
                case 'sizeOnly':
                    if (!el.size) {
                        return next(
                            new AppError(
                                `Something went wrong with product ${el.produc.name}.`
                            )
                        );
                    }
                    let siz = false;
                    const sizOn = {};
                    await Promise.all(
                        el.product.productDetails[0].subDetails.map((els) => {
                            if (els.ecmpssId === el.size) {
                                siz = true;
                                sizOn.bannerImage =
                                    el.product.productDetails[0].bannerImage;
                                sizOn.imageGallery =
                                    el.product.productDetails[0].imageGallery;
                                sizOn.price = els.price;
                                sizOn.discountPrice = els.discountPrice;
                                sizOn.size = els.size;
                            }
                        })
                    );
                    if (!siz)
                        return next(new AppError('Product not found.', 400));
                    el = {
                        userAddress: address,
                        productDetails: {
                            productId: el.product._id,
                            name: el.product.name,
                            description: el.product.description,
                            categorie: el.product.categorie,
                            vendorId: el.product.vendorId,
                            vendorEId: el.product.vendorEId,
                            productEId: el.product.ecmpeId,
                            productType: el.product.productType,
                            price: sizOn.price,
                            discountPrice: sizOn.discountPrice,
                            quantity: el.quantity,
                            for: el.product.for,
                            bannerImage: sizOn.bannerImage,
                            imageGallery: sizOn.imageGallery,
                            size: sizOn.size
                        },
                        orderDetails: {
                            paymentStatus: 'COD'
                        },
                        ecmorId: await encryptID(),
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        badge
                    };
                    return el;
                    break;
                case 'colorWithSize':
                    if (!el.color || !el.size) {
                        return next(
                            new AppError(
                                `Something went wrong with product ${el.produc.name}.`
                            )
                        );
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
                                        colVals.discountPrice =
                                            els2.discountPrice;
                                        colVals.bannerImage = els.bannerImage;
                                        colVals.imageGallery = els.imageGallery;
                                        colVals.color = els.color;
                                        colVals.size = els2.size;
                                    })
                                );
                            }
                        })
                    ]);

                    if (!cols || !sizs) {
                        return next(
                            new AppError(
                                `Something went wrong with product ${el.produc.name}.`
                            )
                        );
                    }
                    el = {
                        userAddress: address,
                        productDetails: {
                            productId: el.product._id,
                            name: el.product.name,
                            description: el.product.description,
                            categorie: el.product.categorie,
                            vendorId: el.product.vendorId,
                            vendorEId: el.product.vendorEId,
                            productEId: el.product.ecmpeId,
                            productType: el.product.productType,
                            price: colVals.price,
                            discountPrice: colVals.discountPrice,
                            quantity: el.quantity,
                            for: el.product.for,
                            bannerImage: colVals.bannerImage,
                            imageGallery: colVals.imageGallery,
                            size: colVals.size,
                            color: colVals.color
                        },
                        orderDetails: {
                            paymentStatus: 'COD'
                        },
                        ecmorId: await encryptID(),
                        userId: req.user._id,
                        userEId: req.user.ecmuId,
                        badge
                    };
                    return el;
                    break;
            }
        })
    );

    await ordermodel.create(order);

    await cartModel.deleteMany({ userId: req.user._id, type: 'order' });
    return res.status(200).json({ status: 'Success' });
});

// get my orders
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const filterQur =
        req.from === 'web'
            ? { 'productDetails.for': process.env.CATEGORYA }
            : [];

    const data = await ordermodel.find({ userId: req.user._id, ...filterQur });
    return res.status(200).json({ status: 'Success', docs: data });
});

// get a order
exports.getAOrder = catchAsync(async (req, res, next) => {
    const filterQur =
        req.from === 'web'
            ? { 'productDetails.for': process.env.CATEGORYA }
            : [];

    const data = await ordermodel.find({
        userId: req.user._id,
        badge: req.params.orderId,
        ...filterQur
    });
    return res.status(200).json({ status: 'Success', docs: data });
});

// cancel order
exports.cancelAOrder = catchAsync(async (req, res, next) => {
    const filterQur =
        req.from === 'web'
            ? { 'productDetails.for': process.env.CATEGORYA }
            : [];
    const order = await ordermodel.findOneAndUpdate(
        {
            ecmorId: req.params.orderId,
            userId: req.user._id,
            ...filterQur,
            'orderDetails.productOrderStatus': 'pending'
        },
        {
            'orderDetails.productOrderStatus': 'canceled'
        },
        {
            new: true,
            runValidators: true
        }
    );
    if (!order) {
        return next(
            new AppError(
                'Something went wrong while cancelling your order.',
                400
            )
        );
    }

    return res.status(200).json({
        status: 'Success'
    });
});

// create new cart
exports.createNewCart = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];
    const product = await productModel.findOne({
        ...filterQur,
        ecmpeId: req.params.productId,
        verified: true
    });

    if (!product) return next(new AppError('Product not found.', 404));

    if (!req.body.quantity)
        return next(new AppError('Please select the quantity.', 400));
    let cart = {};
    switch (product.productType) {
        case 'single':
            cart = {
                userId: req.user._id,
                userEId: req.user.ecmuId,
                for: product.for,
                productId: product._id,
                productEId: product.ecmpeId,
                quantity: req.body.quantity,
                ecmcmID: await encryptID(),
                productType: product.productType,
                type: 'cart'
            };
            break;
        case 'colorOnly':
            if (!req.body.color)
                return next(new AppError('Please select the color.', 400));
            const [colors] = await Promise.all([
                product.productDetails.find(
                    (els) => els.ecmpsId === req.body.color
                )
            ]);

            if (!colors) return next(new AppError('Color not found.', 400));

            cart = {
                userId: req.user._id,
                userEId: req.user.ecmuId,
                for: product.for,
                productId: product._id,
                productEId: product.ecmpeId,
                quantity: req.body.quantity,
                ecmcmID: await encryptID(),
                productType: product.productType,
                type: 'cart',
                color: req.body.color
            };

            break;
        case 'sizeOnly':
            if (!req.body.size)
                return next(new AppError('Please select the size.', 400));

            const [sizes] = await Promise.all([
                product.productDetails[0].subDetails.find(
                    (els) => els.ecmpssId === req.body.size
                )
            ]);

            if (!sizes) return next(new AppError('Color not found.', 400));

            cart = {
                userId: req.user._id,
                userEId: req.user.ecmuId,
                for: product.for,
                productId: product._id,
                productEId: product.ecmpeId,
                quantity: req.body.quantity,
                ecmcmID: await encryptID(),
                productType: product.productType,
                type: 'cart',
                size: req.body.size
            };

            break;
        case 'colorWithSize':
            if (!req.body.size)
                return next(new AppError('Please select the size.', 400));
            if (!req.body.color)
                return next(new AppError('Please select the color.', 400));
            let color = false,
                size = false;
            await Promise.all([
                product.productDetails.map(async (els) => {
                    if (els.ecmpsId === req.body.color) {
                        color = true;
                        await Promise.all(
                            els.subDetails.map((els2) => {
                                if (els2.ecmpssId === req.body.size)
                                    size = true;
                            })
                        );
                    }
                })
            ]);

            if (!color) return next(new AppError('Color not found.', 400));

            if (!size) return next(new AppError('Size not found.', 400));

            cart = {
                userId: req.user._id,
                userEId: req.user.ecmuId,
                for: product.for,
                productId: product._id,
                productEId: product.ecmpeId,
                quantity: req.body.quantity,
                ecmcmID: await encryptID(),
                productType: product.productType,
                type: 'cart',
                size: req.body.size,
                color: req.body.color
            };

            break;
    }

    await cartModel.updateOne(
        { productId: product._id, userId: req.user._id },
        { $set: cart },
        {
            upsert: true
        }
    );

    return res.status(200).json({ status: 'Success' });
});

// my carts
exports.myCarts = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];

    const carts = await cartModel.aggregate([
        {
            $match: {
                userId: req.user._id,
                type: 'cart',
                ...filterQur
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
    ]);
    let price = 0,
        discountPrice = 0,
        finalPrice = 0;
    const products = await Promise.all(
        carts.map(async (el) => {
            switch (el.product.productType) {
                case 'single':
                    el = {
                        bannerImage: el.product.bannerImage,
                        name: el.product.name,
                        price: el.product.price,
                        discountPrice: el.product.discountPrice,
                        type: 'single',
                        quantity: el.quantity,
                        id: el.ecmcmID,
                        product: el.productEId
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
                        colorId: el.color,
                        type: 'colorOnly',
                        quantity: el.quantity,
                        id: el.ecmcmID,
                        product: el.productEId
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
                        sizeId: el.size,
                        type: 'sizeOnly',
                        quantity: el.quantity,
                        id: el.ecmcmID,
                        product: el.productEId
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
                                        colVals.id = el.ecmcmID;
                                        colVals.product = el.productEId;
                                        colVals.colorId = els.ecmpsId;
                                        colVals.sizeId = els2.ecmpssId;
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
    req.body = { products, price, discountPrice, finalPrice };
    return next();
});

exports.sendJsonForCart = (req, res) =>
    res.status(200).json({ status: 'Success', docs: req.body });

// delet my cart
exports.deleteMyCart = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];

    const carts = await cartModel.findOneAndDelete({
        userId: req.user._id,
        ...filterQur,
        ecmcmID: req.params.productId
    });

    if (!carts) return next(new AppError('Cart not found.', 404));

    return res.status(200).json({ status: 'Success' });
});

// create new art
exports.addWishList = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];
    const product = await productModel.findOne({
        ...filterQur,
        ecmpeId: req.params.productId,
        verified: true
    });

    if (!product) return next(new AppError('Product not found.', 404));

    const wishlist = await wishlistModel.updateOne(
        { productId: product._id, userId: req.user._id },
        {
            $set: {
                userId: req.user._id,
                productId: product._id,
                productEId: req.params.productId,
                for: product.for,
                ecmwlId: await encryptID()
            }
        },
        {
            upsert: true
        }
    );

    return res.status(200).json({ status: 'Success' });
});

// my wishlit
exports.getMyWishlist = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];

    const wishlist = await wishlistModel.find({
        userId: req.user._id,
        ...filterQur
    });

    req.body = wishlist;
    return next();
});

// send wishlist
exports.sendWishlistJson = (req, res) =>
    res.status(200).json({
        status: 'Sucess',
        docs: req.body
    });

// delet my cart
exports.deleteWishLists = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];

    const wishlits = await wishlistModel.findOneAndDelete({
        userId: req.user._id,
        ...filterQur,
        ecmwlId: req.params.productId
    });

    if (!wishlits) return next(new AppError('Wishlit not found.', 404));

    return res.status(200).json({ status: 'Success' });
});

exports.getAdditionalProductDetails = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];
    const product = await productModel
        .findOne({
            ecmpeId: req.params.productId,
            verified: true,
            ...filterQur
        })
        .lean();
    if (!product) return next(new AppError('Invalid product.', 400));
    let details = false;
    if (
        product.productType === 'colorOnly' ||
        product.productType === 'colorWithSize'
    ) {
        if (!req.body.color) return next(new AppError('Invalid product.', 400));
        await Promise.all(
            product.productDetails.map((el) => {
                if (el.ecmpsId === req.body.color) {
                    details = { ...el, type: product.productType };
                }
            })
        );
    }

    if (!details) return next(new AppError('Invalid product.', 400));
    return res.status(200).json({ status: 'Success', docs: details });
});

//
exports.moveCartToCheckout = catchAsync(async (req, res, next) => {
    const filterQur = req.from === 'web' ? { for: process.env.CATEGORYA } : [];
    const [carts, b] = await Promise.all([
        cartModel.find({
            userId: req.user._id,
            ...filterQur,
            type: 'cart'
        }),
        cartModel.deleteMany({
            userId: req.user._id,
            ...filterQur,
            type: 'order'
        })
    ]);

    if (carts.length !== req.body.length) {
        return next(
            new AppError(
                'Something went wrong while processing your request.',
                400
            )
        );
    }

    await Promise.all(
        req.body.map(async (el) => {
            await Promise.all(
                carts.map(async (els) => {
                    if (el.id === els.ecmcmID) {
                        if (!el.quantity)
                            return next(
                                new AppError(
                                    'Quantity should be included.',
                                    400
                                )
                            );
                        await cartModel.create({
                            productEId: els.productEId,
                            productId: els.productId._id,
                            userId: req.user._id,
                            userEId: req.user.ecmuId,
                            for: els.for,
                            quantity: el.quantity,
                            type: 'order',
                            ecmcmID: await encryptID(),
                            productType: els.productType,
                            color: els.color,
                            size: els.size
                        });
                    }
                })
            );
        })
    );

    return res.status(200).json({ status: 'Success' });
});

exports.getVendorHome = catchAsync(async (req, res, next) => {
    const year = req.query.year ? req.query.year * 1 : new Date().getFullYear();
    const startDate = new Date(
        !!year ? year : new Date().getFullYear(),
        0,
        0,
        0,
        0,
        0,
        0
    );
    const endDate = new Date(
        !!year ? year : new Date().getFullYear(),
        11,
        31,
        23,
        59,
        59,
        999
    );
    const [productsCount, ordersCount, [orderStates], products, orders] =
        await Promise.all([
            productModel.count({ vendorId: req.user._id }),
            ordermodel.count({ 'productDetails.vendorId': req.user._id }),
            ordermodel.aggregate([
                {
                    $match: {
                        'productDetails.vendorId': req.user._id,
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $project: {
                        _id: null,
                        data: { $month: '$createdAt' }
                    }
                },
                {
                    $sort: { data: -1 }
                },
                {
                    $group: {
                        _id: '$data',
                        count: { $sum: 1 }
                    }
                },

                {
                    $group: {
                        _id: null,
                        mergedObjects: {
                            $push: {
                                k: { $toString: '$_id' },
                                v: '$count'
                            }
                        }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: { $arrayToObject: '$mergedObjects' }
                    }
                }
            ]),
            productModel
                .find({ vendorId: req.user._id })
                .sort({ createdAt: -1 })
                .limit(5),
            ordermodel
                .find({ 'productDetails.vendorId': req.user._id })
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

    return res.json({
        status: 'Success',
        productsCount,
        ordersCount,
        orderStates,
        products,
        orders
    });
});

exports.getVendorOrders = catchAsync(async (req, res, next) => {
    const activepage = !!req.query?.apage * 1 ? req.query?.apage * 1 : 1;
    const compage = !!req.query?.cpage * 1 ? req.query?.cpage * 1 : 1;
    const [[order], activecount, historycount] = await Promise.all([
        ordermodel.aggregate([
            {
                $match: {
                    'productDetails.vendorId': req.user._id
                }
            },
            {
                $facet: {
                    active: [
                        {
                            $match: {
                                'orderDetails.productOrderStatus': 'pending'
                            }
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $skip: ((!!activepage ? activepage : 1) - 1) * 25
                        },
                        { $limit: 25 }
                    ],
                    history: [
                        {
                            $match: {
                                'orderDetails.productOrderStatus': {
                                    $ne: 'pending'
                                }
                            }
                        },
                        {
                            $sort: { createdAt: -1 }
                        },
                        {
                            $skip: ((!!compage ? compage : 1) - 1) * 25
                        },
                        { $limit: 25 }
                    ]
                }
            }
        ]),
        ordermodel.count({
            'productDetails.vendorId': req.user._id,
            'orderDetails.productOrderStatus': 'pending'
        }),
        ordermodel.count({
            'productDetails.vendorId': req.user._id,
            'orderDetails.productOrderStatus': { $ne: 'pending' }
        })
    ]);

    return res.json({ status: 'Success', order, activecount, historycount });
});

exports.getOrderDetails = catchAsync(async (req, res, next) => {
    const order = await ordermodel.findOne({
        'productDetails.vendorId': req.user._id,
        ecmorId: req.params.orderId
    });

    if (!order) return next(new AppError('Order not found!', 404));

    return res.status(200).json({ status: 'Success', docs: order });
});

exports.getMyProducts = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const products = await productModel
        .find({ vendorId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(((!!pgno ? pgno : 1) - 1) * 25)
        .limit(25);
    const count = await productModel.count({ vendorId: req.user._id });
    return res.json({ status: 'Success', docs: products, count });
});

exports.getMyProduct = catchAsync(async (req, res, next) => {
    const product = await productModel
        .findOne({
            vendorId: req.user._id,
            ecmpeId: req.params.productId
        })
        .populate('reviews');
    if (!product) return next(new AppError('Product not found.', 404));

    return res.json({ status: 'Success', docs: product });
});
