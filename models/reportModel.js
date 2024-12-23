// ============================================================
// Import packages
const mongoose = require('mongoose');

// ============================================================
// mongoose schema
const appReportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            requried: [true, 'User id should be included.'],
            select: false,
            ref: 'Users'
        },
        userEId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        ecmarId: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ============================================================
// create schema
const appReportModel = mongoose.model('app report', appReportSchema);

// ============================================================
// export model
module.exports = appReportModel;
