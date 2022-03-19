var express = require('express');
var router = express.Router();
module.exports = router;
const Employee = require('../models/employeeModel');
//setting up express validator
const { check, validationResult } = require('express-validator');// ES6 standard for destructuring an object


