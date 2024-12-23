const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Users'
        },
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Products'
        },
        productEId: {
            type: String,
            required: true
        },
        for: {
            type: String,
            enum: [process.env.CATEGORYA, process.env.CATEGORYB],
            required: [true, 'Product must contain website']
        },
        ecmwlId: {
            type: String,
            required: true,
            unique: true
        }
    },
    { timestamps: true }
);

wishListSchema.pre(/^find/, function (next) {
    this.populate([
        {
            path: 'productId',
            select: 'name bannerImage price categorie discountPrice slug'
        }
    ]);
    next();
});

const wishlistModel = mongoose.model('Wishlist', wishListSchema);

module.exports = wishlistModel;
