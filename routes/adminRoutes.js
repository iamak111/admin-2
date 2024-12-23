const express = require('express');

const authControllers = require('../controllers/authControllers');
const adminControllers = require('../controllers/adminControllers');

const router = express.Router();

router.use(authControllers.protect, authControllers.restrictTo('admin'));

router.patch(
    '/vendor-management/:status/:vendorId',
    adminControllers.updateVendorDetails
);

router.post(
    '/category',
    adminControllers.uploadSingleImage('file'),
    adminControllers.createCategorie
);

router.delete('/category/:categorieId', adminControllers.deleteCategorie);

module.exports = router;
