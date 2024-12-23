const cartModel = require('../models/cartModel');

exports.getAllCart = async (req, res, next) => {
    const cart = await cartModel.find();
    res.status(200).json({
        status: 'Success',
        data: {
            cart
        }
    });
};
