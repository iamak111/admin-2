const AppError = require('../util/appError');

const handleCastErrorDB = (err) => {
    const message = `The URL is not valid ${err._id}:${err.value}`;
    return new AppError(message, 400);
};
const handleDublicateNameDB = (err) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const message = `You are entered name ${value} is already exist. Please try another name.`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const data = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input Data.${data.join(' ')}`;

    return new AppError(message, 400);
};
const sendErrDev = (err, req, res) => {
    // if (err.message.startsWith('E11000 duplicate key')) err.message
    const text = err.message;
    if (text.startsWith('E11000 duplicate key')) {
        const pattern = /{(.*):/;
        const result = text.match(pattern);
        err.message = `You are entered ${result[1]} is already exist.`;
    }
    if (text.includes('E11000 duplicate key')) {
        let reg = /\{([^}]+)\}/g;
        reg = text.match(reg)[0].split(' ')[1].slice(0, -1);
        err.message = `This ${reg} is already exist please try another ${reg}.`;
    }
    if (
        text.startsWith('Cast to embedded failed for') ||
        text.startsWith('Cast to Number failed for value')
    ) {
        err.message = 'Please enter the valid details..';
    }

    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            err: err,
            message: err.message,
            stackTrace: err.stack
        });
    }

    res.status(err.statusCode).render('admin/error', {
        notSideBar: true,
        title: 'Oobs Something went wrong',
        statusCode: err.statusCode,
        msg: err.message
    });
};

// eslint-disable-next-line no-unused-vars
const handleInvalidToken = (err) =>
    new AppError('Invalid Token.Please login again...', 401);
// eslint-disable-next-line no-unused-vars
const hangleExpiredToken = (err) =>
    new AppError('Your session was expired please login again', 401);

const sendErrPro = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        return res.status(err.statusCode).json({
            status: 400,
            message: 'Something went wrong! Please try again later'
        });
    }

    if (err.isOperational) {
        return res
            .status(err.statusCode)
            .render('admin/error', {
                notSideBar: true,
                title: 'Oobs Something went wrong',
                status: err.status,
                msg: err.message
            });
    }

    return res
        .status(err.statusCode)
        .render('admin/error', {
            notSideBar: true,
            title: 'Oobs Something went wrong',
            msg: 'Something went wrong! Please try again later'
        });
};

module.exports = (err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_DEV === 'development') {
        sendErrDev(err, req, res);
    } else if (process.env.NODE_DEV === 'production') {
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDublicateNameDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleInvalidToken(err);
        if (err.name === 'TokenExpiredError') err = hangleExpiredToken(err);
        sendErrPro(err, req, res);
    }
    next();
};
