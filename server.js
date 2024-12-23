const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// import middlewares
const globalErrorController = require('./controllers/errorConroller');
const AppError = require('./util/appError');
// import routes
const userRouter = require('./routes/userRoutes');
const categorieRouter = require('./routes/categorieRoutes');
const adminRouter = require('./routes/adminRoutes');
const adminViewRouter = require('./routes/adminViewRoutes');

dotenv.config({ path: './env/config.env' });

// send data via json format
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.set('view engine', 'pug');
// set view path
app.set('views', path.join(__dirname, 'views'));
// set assets path
app.use(express.static(path.join(__dirname, 'public')));
// connect mongodb
// eslint-disable-next-line camelcase
const mongoose_url = process.env.DATABASE_URL;

mongoose
    .connect(mongoose_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    // eslint-disable-next-line no-unused-vars
    .then((con) => {
        // eslint-disable-next-line no-console
        console.log('connection was successfull');
    });

// set morgan
app.use(morgan('dev'));
// set view engine

// Set Routes

app.use(async (req, res, next) => {
    req.query.for = process.env.WEBSITE_CATEGORY;
    return next();
});
app.use('/admin', adminViewRouter);
app.use('/api/v1/user/', userRouter);
app.use('/api/v1/category', categorieRouter);
app.use('/api/v1/admin', adminRouter);

// handle  wrong url
app.all('*', (req, res, next) =>
    next(new AppError(`undefiefd url ${req.originalUrl}`, 404))
);

// user global error controller
app.use(globalErrorController);

app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Port listen in ${process.env.PORT}`);
});
