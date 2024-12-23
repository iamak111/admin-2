const multer = require('multer');

const factoryController = require('./factoryHandler');
const catchAsync = require('../util/catchAsync');
const userModel = require('../models/userModel');
const ordermodel = require('../models/orderModel');
const productModel = require('../models/productModel');
const appError = require('../util/appError');
const addressModel = require('../models/addressModel');
const encryptID = require('../util/encryptID');
const categorieModel = require('../models/categorieModel');
const appReportModel = require('../models/reportModel');
const AppError = require('../util/appError');
const bucket = require('../util/firebase');
const reviewModel = require('../models/reviewModel');

// ============================================================
// Controllers

const multerStorage = multer.memoryStorage();

function multerFilter(req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not a image type please upload the image', 400),
            false
        );
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// singleImage
exports.uploadSingleImage = (name) => upload.single(name);

// get admin login
exports.getAdminLogin = (req, res, next) =>
    res.render('admin/login', { notSideBar: true });

exports.logout = catchAsync((req, res, next) => {
    res.cookie('jwt', 'loggout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    return res.redirect('/');
});

exports.getAdminHomeDetails = catchAsync(async (req, res, next) => {
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
    const [
        userCount,
        vendorCount,
        verificationBendingCount,
        orderCount,
        [userStates],
        userList,
        vendorList,
        [orderState],
        reports
    ] = await Promise.all([
        userModel.count({ role: 'user' }),
        userModel.count({ role: 'vendor' }),
        userModel.count({ role: 'vendor', accountVerification: 'requested' }),
        ordermodel.count({
            'productDetails.for': process.env.WEBSITE_CATEGORY
        }),
        userModel.aggregate([
            {
                $match: {
                    role: 'user',
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
        userModel.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5),
        userModel.find({ role: 'vendor' }).sort({ createdAt: -1 }).limit(5),
        ordermodel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate },
                    'productDetails.for': process.env.WEBSITE_CATEGORY
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
        appReportModel
            .find()
            .populate('userId')
            .sort({ createdAt: -1 })
            .limit(5)
    ]);

    return res.render('admin/home', {
        userCount,
        vendorCount,
        verificationBendingCount,
        orderCount,
        userStates,
        userList,
        vendorList,
        orderState,
        reports,
        fors: 'dashboard'
    });
});

// get vendor home detials
exports.getVendorManagemetnDetails = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const [vendorCount, productCount, orderCount, vendors] = await Promise.all([
        userModel.count({ role: 'vendor', accountVerification: 'accepted' }),
        productModel.count({
            verified: true,
            for: process.env.WEBSITE_CATEGORY
        }),
        ordermodel.count({
            'productDetails.for': process.env.WEBSITE_CATEGORY
        }),
        userModel
            .find({ role: 'vendor', accountVerification: 'accepted' })
            .sort({ createdAt: -1 })
            .skip(((!!pgno ? pgno : 1) - 1) * 25)
            .limit(25)
    ]);
    return res.render('admin/vendors', {
        vendorCount,
        productCount,
        orderCount,
        vendors,
        fors: 'vendors',
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

exports.getPendingVendorVerifications = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const data = await userModel
        .find({ role: 'vendor', accountVerification: 'requested' })
        .sort({ createdAt: -1 })
        .skip(((!!pgno ? pgno : 1) - 1) * 25)
        .limit(25);

    return res.render('admin/vendor-verification-list', {
        fors: 'verifications',
        vendors: data,
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

exports.getAVendorDetails = catchAsync(async (req, res, next) => {
    const user = await userModel
        .findOne({
            role: 'vendor',
            ecmuId: req.params.vendorId
        })
        .select('+verifyDocuments');
    if (!user) return next(new appError('Vendor not found!', 404));
    let arr = [];
    if (req.query.forw) arr = { verify: true };
    return res.render('admin/vendor-details', {
        user,
        fors: !req.query.forw ? 'vendors' : 'verifications',
        ...arr
    });
});

exports.getVendorOrderDetails = catchAsync(async (req, res, next) => {
    const activepage = !!req.query?.apage * 1 ? req.query?.apage * 1 : 1;
    const compage = !!req.query?.cpage * 1 ? req.query?.cpage * 1 : 1;
    const [[orders], user] = await Promise.all([
        ordermodel.aggregate([
            {
                $match: {
                    'productDetails.vendorEId': req.params.vendorId,
                    'productDetails.for': process.env.WEBSITE_CATEGORY
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
        userModel.findOne({ ecmuId: req.params.vendorId, role: 'vendor' })
    ]);

    return res.render('admin/vendor-orders', { orders, user, fors: 'vendors' });
});

exports.getVendorProductList = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const [products, user] = await Promise.all([
        productModel
            .find({
                vendorEId: req.params.vendorId,
                for: process.env.WEBSITE_CATEGORY
            })
            .sort({ createdAt: -1 })
            .skip(((!!pgno ? pgno : 1) - 1) * 25)
            .limit(25),
        userModel.findOne({ ecmuId: req.params.vendorId, role: 'vendor' })
    ]);
    if (!user) return next(new appError('Vendor not found.', 404));

    if (!products) return next(new appError('Product not found.', 404));

    return res.render('admin/vendor-products', {
        products,
        user,
        fors: 'vendors',
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

exports.getVendorProductDetails = catchAsync(async (req, res, next) => {
    const [product, user] = await Promise.all([
        productModel
            .findOne({
                for: process.env.WEBSITE_CATEGORY,
                vendorEId: req.params.vendorId,
                ecmpeId: req.params.productId
            })
            .populate('reviews'),
        userModel.findOne({ ecmuId: req.params.vendorId, role: 'vendor' })
    ]);
    if (!product) return next(new appError('Product not found.', 404));

    return res.render('admin/vendor-products-details', {
        product,
        user,
        fors: 'vendors'
    });
});

exports.getUserLists = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const data = await userModel
        .find({ role: 'user' })
        .sort({ createdAt: -1 })
        .skip(((!!pgno ? pgno : 1) - 1) * 25)
        .limit(25);

    return res.render('admin/users', {
        fors: 'users',
        docs: data,
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

exports.getAllReports = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const data = await appReportModel
        .find()
        .populate('userId')
        .sort({ createdAt: -1 })
        .skip(((!!pgno ? pgno : 1) - 1) * 25)
        .limit(25);

    return res.render('admin/reports', {
        fors: 'reports',
        reports: data,
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});

exports.getUserDetails = catchAsync(async (req, res, next) => {
    const [user, [orders]] = await Promise.all([
        userModel.findOne({ ecmuId: req.params.userId }),
        ordermodel.aggregate([
            {
                $match: {
                    userEId: req.params.userId,
                    'productDetails.for': process.env.WEBSITE_CATEGORY
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
                        }
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
                        }
                    ]
                }
            }
        ])
    ]);
    const address = await addressModel.find({ userId: user._id });
    return res.render('admin/user-details', {
        user,
        fors: 'users',
        orders,
        address
    });
});

exports.updateVendorDetails = catchAsync(async (req, res, next) => {
    const user = await userModel.findOneAndUpdate(
        {
            accountVerification: 'requested',
            ecmuId: req.params.vendorId,
            role: 'vendor'
        },
        {
            accountVerification: req.params.status,
            accountVerificationAt: Date.now()
        },
        { runValidators: true }
    );
    const status = req.params.status === 'accepted' ? true : false;

    await productModel.updateMany(
        { vendorEId: req.params.vendorId },
        { verified: status },
        { runValidators: true }
    );

    return res.status(200).json({ status: 'Success' });
});

exports.createCategorie = catchAsync(async (req, res, next) => {
    req.body.ecmcId = await encryptID();

    req.body.for =
        req.body.website === 'a'
            ? process.env.CATEGORYA
            : process.env.CATEGORYB;

    const fileName = 'images/' + req.body.ecmcId;

    // Upload the image to Firebase Storage
    const fileUpload = bucket.file(fileName);
    const stream = fileUpload.createWriteStream({
        metadata: {
            contentType: req.file.mimetype
        }
    });

    stream.on('error', (err) => {
        console.error('Error uploading image:', err);
        return next(new AppError('Internal Server Error', 400));
    });

    stream.on('finish', async () => {
        console.log('Image uploaded successfully');

        // Get the download URL
        const [downloadURL] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: '01-01-2100' // Set an expiration date if needed
        });
        req.body.bannerImage = downloadURL;
        await categorieModel.create(req.body);

        res.status(200).json({
            status: 'Success'
        });
    });

    stream.end(req.file.buffer);
});

exports.deleteCategorie = catchAsync(async (req, res, next) => {
    const categorie = await categorieModel.findOneAndDelete({
        for: process.env.WEBSITE_CATEGORY,
        ecmcId: req.params.categorieId
    });

    if (!categorie) return next(new appError('Categorie not found!', 404));

    return res.json({ status: 'Success' });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const pgno = !!req.query?.page * 1 ? req.query?.page * 1 : 1;
    const categories = await categorieModel
        .find({ for: process.env.WEBSITE_CATEGORY })
        .sort({ name: 1 })
        .skip(((!!pgno ? pgno : 1) - 1) * 25)
        .limit(25);

    return res.render('admin/categories', {
        categories,
        fors: 'category',
        url: req.protocol + '://' + req.get('host') + req.originalUrl
    });
});
