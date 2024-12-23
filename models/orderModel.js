const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userAddress: {
            type: Object
        },
        productDetails: {
            productId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Products',
                required: true
            },
            name: String,
            description: String,
            categorie: {
                type: String,
                required: [true, 'A product must contain categories']
            },
            vendorId: {
                type: mongoose.Schema.ObjectId,
                ref: 'Users'
            },
            vendorEId: {
                type: String,
                required: true
            },
            productEId: { type: String, required: true },

            productType: {
                type: String,
                enum: ['single', 'colorOnly', 'sizeOnly', 'colorWithSize']
            },
            color: {
                type: String
            },
            size: {
                type: String
            },
            price: {
                type: Number
            },
            discountPrice: {
                type: Number,
                default: 0
            },
            quantity: {
                type: Number,
                min: 1,
                required: [true, 'Product must contain quantity']
            },
            for: {
                type: String,
                enum: [process.env.CATEGORYA, process.env.CATEGORYB],
                required: [true, 'Product must contain website']
            },
            bannerImage: { type: String, required: true },
            imageGallery: [String]
        },
        orderDetails: {
            shippingPrice: {
                type: Number,
                default: 0
            },
            razorPay: {
                paymentId: String,
                orderId: String,
                paymentSignature: String
            },
            stripe: { paymentId: String },
            paypal: {
                paymentId: String,
                token: String,
                PayerID: String
            },
            paymentMethod: {
                type: String,
                enum: ['stripe', 'paypal', 'amazon', 'razorpay', 'cash'],
                required: [true, 'Product must have a payment method'],
                default: 'cash'
            },
            paymentStatus: {
                type: String,
                enum: ['PAID', 'COD']
            },
            productOrderStatus: {
                type: String,
                enum: ['delivered', 'pending', 'canceled'],
                default: 'pending'
            },
            orderStatus: {
                type: String,
                enum: ['placed', 'accepted', 'packed', 'shipped', 'delivered'],
                default: 'placed'
            },
            datePlaced: {
                type: Date
            },
            dateDelivered: {
                type: Date
            }
        },
        ecmorId: {
            type: String,
            required: true,
            unique: true
        },
        badge: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Users',
            required: true
        },
        userEId: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
// orderSchema.pre(/^find/, function (next) {
//     this.populate([
//         {
//             path: 'productDetails.productId',
//             select: '_id createdAt description'
//         },
//         {
//             path: 'productDetails.vendor',
//             select: '_id'
//         }
//     ]);
//     next();
// });

const ordermodel = mongoose.model('userorder', orderSchema);

module.exports = ordermodel;
