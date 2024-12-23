const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product must have name'],
            trim: true,
            unique: true
        },

        vendorId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Users',
            required: [true, 'product must contain vendor.']
        },
        vendorEId: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            unique: true
        },
        active: {
            type: Boolean,
            default: true
        },
        price: {
            type: Number,
            required: [true, 'Product must have price'],
            trim: true
        },
        discountPrice: {
            type: Number,
            default: 0
        },
        categorie: {
            type: String,
            required: [true, 'A product must contain categories']
        },

        for: {
            type: String,
            enum: [process.env.CATEGORYA, process.env.CATEGORYB],
            required: [true, 'Product must contain website']
        },
        description: {
            type: String,
            minlength: 2,
            required: true
        },
        productType: {
            type: String,
            required: true,
            enum: ['single', 'colorOnly', 'sizeOnly', 'colorWithSize']
        },

        bannerImage: {
            type: String,
            required: true
        },
        imageGallery: {
            type: [String]
        },
        productDetails: [
            {
                bannerImage: {
                    type: String,
                    required: [true, 'Banner image should be included.']
                },
                imageGallery: [String],
                color: String,
                subDetails: [
                    {
                        size: {
                            type: String,
                            required: true,
                            default: 'not-defined'
                        },
                        price: {
                            type: Number,
                            required: true
                        },
                        discountPrice: {
                            type: Number
                        },

                        ecmpssId: { type: String, required: true }
                    }
                ],
                ecmpsId: {
                    type: String,
                    required: true
                }
            }
        ],
        features: [
            {
                title: String,
                description: String
            }
        ],
        specification: [
            {
                title: String,
                description: String
            }
        ],
        ratingsAverage: {
            type: Number,
            default: 0,
            max: 5,
            set: (val) => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        verified: {
            type: Boolean,
            default: true
        },
        ecmpeId: { type: String, required: true, unique: true },
        dealOfTheDay: {
            type: Boolean,
            requried: true,
            default: false
        },
        dealOfTheDayStartsAt: Date,
        dealOfTheDayExpires: Date
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

productSchema.index({
    name: 'text',
    slug: 'text',
    categorie: 'text',
    description: 'text',
    productType: 'text',
    'productDetails.color': 'text',
    'productDetails.size': 'text',
    'features.title': 'text',
    'features.description': 'text',
    'specification.title': 'text',
    'specification.description': 'text'
});

productSchema.virtual('reviews', {
    ref: 'Reviews',
    foreignField: 'productId',
    localField: '_id'
});

const productModel = mongoose.model('Products', productSchema);

module.exports = productModel;
