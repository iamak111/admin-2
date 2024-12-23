const mongoose = require('mongoose');
const slugify = require('slugify');

const categorieSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A categorie must contain a name'],
            trim: true,
            unique: true
        },
        slug: {
            type: String
        },
        for: {
            type: String,
            enum: [process.env.CATEGORYA, process.env.CATEGORYB],
            required: [true, 'Product must contain website']
        },
        bannerImage: {
            type: String,
            required: true,
            default: 'sample.jpg'
        },
        ecmcId: { type: String, required: true, unique: true }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

categorieSchema.pre('save', async function (next) {
    this.slug = slugify(this.name, { lower: true });

    next();
});

const categorieModel = mongoose.model('categories', categorieSchema);

module.exports = categorieModel;
