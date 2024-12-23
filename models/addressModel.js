const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter the name']
    },
    phone: {
        type: String,
        required: [true, 'please enter the phone']
    },
    phone1: {
        type: String,
        required: [true, 'please enter the phone']
    },
    country: {
        type: String,
        required: [true, 'please enter the country']
    },
    streetAddress: {
        type: String,
        required: [true, 'please enter the streetAddress']
    },
    town: {
        type: String,
        required: [true, 'please enter the town']
    },
    state: {
        type: String,
        required: [true, 'please enter the state']
    },
    zip: {
        type: String,
        required: [true, 'please enter the zip']
    },
    landmark: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true
    },
    ecmaeId: {
        type: String,
        required: true,
        unique: true
    }
});

addressSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'name email'
    });
    next();
});
const addressModel = mongoose.model('userAddress', addressSchema);

module.exports = addressModel;
