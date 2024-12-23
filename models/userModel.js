// import mongoose
const mongoose = require('mongoose');

// import bcrypt
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// import validaor
const validator = require('validator');

// create mongoose schema for user
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'User must have a name.']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            // required: [true, 'Email should be included'],
            validate: [validator.isEmail, 'Please Enter the valide Email.']
        },
        shopName: {
            type: String,
            trim: true
        },
        shopEmail: {
            type: String,
            trim: true,
            lowercase: true,
            // required: [true, 'Email should be included'],
            validate: [validator.isEmail, 'Please Enter the valide Email.']
        },
        verifyDocuments: { type: [String], select: false },
        profile: {
            type: String,
            default:
                'https://cdn.pixabay.com/photo/2015/03/04/22/35/avatar-659651_1280.png'
        },
        shopPhone: {
            type: String
        },
        shopAddress: String,
        accountVerification: {
            type: String,
            enum: ['requested', 'accepted', 'rejected']
        },
        accountVerificationAt: Date,
        phone: {
            type: String,
            required: true,
            unique: true
        },
        shopImage: [String],
        city: String,
        state: String,
        country: String,
        zipcode: Number,
        GSTNumber: String,
        phoneVerificationToken: String,
        phoneVerificationTokenExpires: Date,
        accountVerificationToken: String,
        accountVerificationExpires: Date,
        passwordResetToken: String,
        passwordResetTokenExpires: Date,
        passwordChangeAt: Date,
        role: {
            type: String,
            enum: ['user', 'vendor', 'admin'],
            default: 'user'
        },

        ecmuId: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

// check token session
userSchema.methods.checkPassAfterToken = function (JWTCreatDate) {
    if (this.passwordChangeAt) {
        const getPerfectTime = parseInt(
            this.passwordChangeAt.getTime() / 1000,
            10
        );

        return JWTCreatDate < getPerfectTime;
    }
    return false;
};

userSchema.methods.generateOtpForUser = function () {
    const conformationtoken = Math.floor(100000 + Math.random() * 900000);
    this.phoneVerificationToken = (
        (((conformationtoken / 6) * 2) / 4523 - 123) / 1212 +
        452
    ).toString(26);
    this.phoneVerificationTokenExpires = Date.now() + 10 * 60 * 1000;

    return conformationtoken;
};

// create a model for user
const userModel = mongoose.model('Users', userSchema);

// export user model
module.exports = userModel;
