const express = require('express');
const categorieController = require('../controllers/categoryController');
const authControllers = require('../controllers/authControllers');

const route = express.Router();

route.use(authControllers.protect);

route.get('/', categorieController.getAllCategorie);

module.exports = route;
