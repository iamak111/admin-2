const catchAsync = require('../util/catchAsync');
const ApiFeature = require('../util/apiFeatures');
const AppError = require('../util/appError');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // find all product.
        const apiClass = new ApiFeature(Model.find(filter), req.query)
            .filter()
            .sort()
            .fieldSelect();
        // .pagenate();
        const product = await apiClass.query;

        //   send response to client
        res.status(200).json({
            status: 'Success',
            data: {
                product
            }
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const product = await Model.create(req.body);

        res.status(200).json({
            status: 'Success'
        });
    });

exports.getOne = (Model, populateOption) =>
    catchAsync(async (req, res, next) => {
        let query = await Model.findById(req.params.id);

        if (populateOption)
            query = query.populate([
                { path: populateOption[0] },
                { path: populateOption[1] }
            ]);
        const doc = await query;
        if (!doc) {
            return next(
                new AppError("can't find a document with this id", 404)
            );
        }
        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return next(
                new AppError("can't find a document with this id", 404)
            );
        }

        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    });

exports.findOneAndUpdate = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findOneAndUpdate(req.searchQuery, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) {
            return next(
                new AppError("can't find a document with this id", 404)
            );
        }

        res.status(200).json({
            status: 'Success'
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(
                new AppError("can't find a document with this id", 404)
            );
        }
        res.json({
            status: 'Success',
            data: doc
        });
    });
