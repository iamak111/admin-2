const mongoose = require('mongoose');
const productModel = require('./productModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review can't be empty."]
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            required: [true, "Rating can't be empty"]
        },

        productId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Products',
            required: [true, 'Review must contain Products.']
        },
        productEId: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Users',
            required: [true, 'Review must contain User']
        },
        ecmerId: { type: String, required: true, unique: true }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
        timeseries: true
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate([
        {
            path: 'productId',
            select: 'name _id'
        },
        {
            path: 'userId',
            select: 'name profile _id'
        }
    ]);
    next();
});

// reviewSchema.statics.createAverageRatingProduct = async function (productId) {
//     const stats = await this.aggregate([
//         {
//             $match: { product: productId }
//         },
//         {
//             $group: {
//                 _id: '$product',
//                 length: { $sum: 1 },
//                 avgRating: { $avg: '$rating' }
//             }
//         }
//     ]);

//     if (stats.length > 0) {
//         await productModel.findByIdAndUpdate(productId, {
//             ratingsAverage: stats[0].avgRating,
//             ratingsQuantity: stats[0].length
//         });
//     }

// };

// reviewSchema.post('save', function () {
//     this.constructor.createAverageRatingProduct(this.product);
// });
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//     this.r = await this.clone().findOne();
//     next();
// });
// reviewSchema.post(/^findOneAnd/, async function () {
//     this.r.constructor.createAverageRatingProduct(this.r.product._id);
// });

const reviewModel = mongoose.model('Reviews', reviewSchema);

module.exports = reviewModel;
