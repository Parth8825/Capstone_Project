const express = require('express');
const bcrypt = require('bcrypt'); // for password encryption
var router = express.Router();
module.exports = router;

const Employee = require('../models/employeeModel');
const Admin = require('../models/adminModel');


//setting up express validator
const { check, validationResult } = require('express-validator');// ES6 standard for destructuring an object

// Home page (Employee page)
router.get('/', function (req, res) {
    //res.send('this one was showing in the browser');
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                const message = req.flash('msg');
                res.render('employee', { employees: employees, message, admin: req.session.username});
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// About us page 
router.get('/aboutus', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('aboutus' , {admin: req.session.username});
    }
    else {
        res.redirect('/login');
    }
});

// User Profile page 
router.get('/userProfile', async function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        let user = await Admin.findOne({username: req.session.username});
        var username = user.username;
        var userMailID = user.mail;
        var userProfile = {
            name: username,
            mailID: userMailID
        }
        res.render('userProfile' , userProfile);
    }
    else {
        res.redirect('/login');
    }
});

// Add Employee page
router.get('/addEmployee', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        const form = {
            firstnameHolder: req.body.firstname,
            lastnameHolder: req.body.lastname,
            emailHolder: req.body.email,
            phoneHolder: req.body.phone,
            addressHolder: req.body.address,
            postcodeHolder: req.body.postcode,
            positionHolder: req.body.position,
            payrateHolder: req.body.payrate
           };
        res.render('employee/addEmployee', {form: form});
    }
    else {
        res.redirect('/login');
    }
});


// Add employee details
router.post('/addEmployee', [
    check('firstname').custom(customFirstNameValidation),
    check('lastname').custom(customLastNameValidation),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('address', 'address is required').not().isEmpty(),
    check('postcode').custom(customPostcodeValidation),
    check('position').custom(customPositionValidation),
    check('payrate').custom(customPayrateValication)
], function (req, res) {
    const form = {
        firstnameHolder: req.body.firstname,
        lastnameHolder: req.body.lastname,
        emailHolder: req.body.email,
        phoneHolder: req.body.phone,
        addressHolder: req.body.address,
        postcodeHolder: req.body.postcode,
        positionHolder: req.body.position,
        payrateHolder: req.body.payrate
       };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('employee/addEmployee', {form: form,
            errors: errors.array()
        });
    }
    else {
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var postcode = req.body.postcode;
        var position = req.body.position;
        var payrate = req.body.payrate;

        var name = firstname + " " + lastname;
        // storing values in object called "employeeData"
        var employeeData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            postcode: postcode,
            position: position,
            payrate: payrate
        }
        // create an object for the model Employee
        var ourEmployees = new Employee(employeeData);
        ourEmployees.save().then(function () {
            console.log('New Employee created');
        });
        req.flash('msg', '\"' + employeeData.name + '\"' +' added successfully !!!');
        res.redirect('/');
    }
});

// edit employee details [get]
router.get('/edit/:employeeId', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        var employeeId = req.params.employeeId;
        console.log(employeeId);
        Employee.findOne({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
            if (employee) {
                res.render('employee/editEmployee', { employee: employee });
            }
            else {
                res.send('No employee found with that id..');
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// edit employee details [post]
router.post('/edit/:id', [
    check('fullname').custom(customFullNameValidation),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('address', 'address is required').not().isEmpty(),
    check('postcode').custom(customPostcodeValidation),
    check('position').custom(customPositionValidation),
    check('payrate').custom(customPayrateValication)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var employeeId = req.params.id;
        Employee.findOne({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
            if(employee){
                res.render('employee/editEmployee', { employee:employee, errors: errors.array()});
            }
            else{
                res.send('no order found with that id...');
            }
        
        });
    }
    else {
        var name = req.body.fullname;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var postcode = req.body.postcode;
        var position = req.body.position;
        var payrate = req.body.payrate;

        // storing values in object called "employeeData"
        var employeeData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            postcode: postcode,
            position: position,
            payrate: payrate
        }

        var id = req.params.id;
        Employee.findOne({ _id: id }, function (err, employee) {
            employee.name = name;
            employee.email = email;
            employee.phone = phone;
            employee.address = address;
            employee.postcode = postcode;
            employee.position = position;
            employee.payrate = payrate;
            employee.save().then(function () {
                console.log('Employee updated');
            });
        });
        res.render('employee/editedEmployeeDetail', employeeData);

    }
});

// delete employee data from database
router.get('/delete/:employeeId', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        var employeeId = req.params.employeeId;
        console.log(employeeId);
        Employee.findByIdAndDelete({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
        });
        req.flash('msg', 'Employee deleted successfully !!!');
        res.redirect('/');
    }
    else {
        res.redirect('/login');
    }
});
 router.get('/employeeDetail/:id', function (req,res){
    if(req.session.userLoggedIn){
        var id = req.params.id;
        Employee.findOne({_id: id}, function (err, employee){
            if(employee){
                res.render('employee/employeeDetail', {employee: employee});
            }
            else{
                res.send('Sorry... No data found');
            }
        })
    }
    else{
        res.redirect('/login');
    }
 });

// Validations
// Defining regular expressions
var phoneRegex = /^[0-9]{10}$/;
var positiveNumRegex = /^[1-9][0-9]*$/;
var postcodeRegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;
var onlyNameRegex = /^[a-zA-Z]+$/;
var onlyFullNameRegex = /^[a-zA-Z]+\s[a-zA-Z]+$/;
var noMorethanTenLettersRegex = /^[a-zA-Z]{0,10}$/;
//var emailregex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

// custome first name validation
function customFirstNameValidation(value){
    if(value === ''){
        throw new Error('First name is required');
    }else if(!checkRegex(value, onlyNameRegex)){
        throw new Error('No special character or numeric values in First Name');
    }else if(!checkRegex(value, noMorethanTenLettersRegex)){
        throw new Error('No more than 10 latters in First Name');
    }
    return true;
}
// custome last name validation
function customLastNameValidation(value){
    if(value === ''){
        throw new Error('Last name is required');
    }else if(!checkRegex(value, onlyNameRegex)){
        throw new Error('No special character or numeric values in Last Name');
    }else if(!checkRegex(value, noMorethanTenLettersRegex)){
        throw new Error('No more than 10 latters in Last Name');
    }
    return true;
}
// custome full name validation
function customFullNameValidation(value){
    if(value === ''){
        throw new Error('Name is required');
    }else if(!checkRegex(value, onlyFullNameRegex)){
        throw new Error('No special character or numeric values for Name');
    }
    return true;
}
// custom phone number validation function
function customPhoneValidation(value) {
    if(value === ''){
        throw new Error('Phone Number is required');
    }
    else if (!checkRegex(value, phoneRegex)) {
        throw new Error('Phone Number  format should be 1231231234');
    }
    return true;
}
// custom postcode validation function
function customPostcodeValidation(value) {
    if(value === ''){
        throw new Error('Post code is required');
    }
    else if (!checkRegex(value, postcodeRegex)) {
        throw new Error('Postcode should be X0X 0X0');
    }
    return true;
}
// custome Position validation
function customPositionValidation(value){
    if(value === ''){
        throw new Error('Postion is required');
    }else if(!checkRegex(value, onlyNameRegex)){
        throw new Error('No special character or numeric values in Position');
    }else if(!checkRegex(value, noMorethanTenLettersRegex)){
        throw new Error('No more than 10 latters in Position');
    }
    return true;
}
// custom payrate validation function
function customPayrateValication(value) {
    if(value == ''){
        throw new Error('Payrate is required');
    }
    else if (!checkRegex(value, positiveNumRegex)) {
        throw new Error('Payrate has to be postive number');
    }
    return true;
}
