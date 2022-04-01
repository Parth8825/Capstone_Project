const express = require('express');
const bcrypt = require('bcrypt'); // for password encryption
var router = express.Router();
module.exports = router;

const Admin = require('../models/adminModel');
const Employee = require('../models/employeeModel');

//setting up express validator
const { check, validationResult } = require('express-validator');// ES6 standard for destructuring an object
const e = require('connect-flash');

//login page
router.get('/login', function (req, res) {
    res.render('login');
});
// login user
router.post('/login', async function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;

    Admin.findOne({ username: user}).exec(async function (err, admin) {
        console.log('Error: ' + err);
        console.log('Admin: ' + admin);
        if(user == null){
            return res.render('login', { loginError: 'Soory, cannot find user !!' })
        }
        try{
            if(await bcrypt.compare(pass, admin.password)){
                // store username in session and set logged in true
                req.session.username = admin.username;
                req.session.userLoggedIn = true;
                // redirect to the dashboard
                res.redirect('/');
            }
            else {
            res.render('login', { loginError: 'Soory, cannot login! Please Signup' });
            }
        }
        catch{
            res.status(500).send();
        }
    });
});
// sign-up form
router.post('/signup', [
    check('newUsername', 'username is required').not().isEmpty(),
    check('newEmail', 'E-mail is required').isEmail(),
    check('newPassword', 'password is required').not().isEmpty()
],async function (req, res) {
    const errors = validationResult(req);
    try{
        if (!errors.isEmpty()) {
            res.render('login', {
                errors: errors.array()
            });
        }
        else{
            //creates a salt to generate new hash value every time.
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt); //converts password into hashcode and store into hashedPassword
            console.log(salt);
            console.log(hashedPassword);
            var newUser = req.body.newUsername;
            var newEmail = req.body.newEmail;
            var newPassword = hashedPassword;
    
            var loginData = {
                username: newUser,
                mail: newEmail,
                password: newPassword
            }
            
            var userLoginData = new Admin(loginData);
            userLoginData.save().then(function (){
                console.log('Login data saved');
            });
            res.render('login');
        }
    }
    catch{
        res.status(500).send();
    }
    
});

// logout process
router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send("Error")
        }
        else {
            res.render('login', { logout: "logout successfully....!" })
        }
    })
});
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
                res.render('employee', { employees: employees, message});
            }

        });
    }
    else {
        res.redirect('/login');
    }
});

// Add Employee page
router.get('/addEmployee', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('employee/addEmployee');
    }
    else {
        res.redirect('/login');
    }
});


// Add employee details
router.post('/addEmployee', [
    check('firstname', 'First name is required').not().isEmpty(),
    check('lastname', 'Last name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('postcode').custom(customPostcodeValidation),
    check('payrate').custom(customPayrateValication)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('employee/addEmployee', {
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
        req.flash('msg', 'Employee added successfully !!!');
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
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('postcode').custom(customPostcodeValidation),
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
        var name = req.body.name;
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
var positiveNum = /^[1-9][0-9]*$/;
var postcoderegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;

// function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}
// custom phone number validation function
function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Number has to be in 10 digits');
    }
    return true;
}
// custom postcode validation function
function customPostcodeValidation(value) {
    if (!checkRegex(value, postcoderegex)) {
        throw new Error('Postcode should be X0X 0X0');
    }
    return true;
}
// custom payrate validation function
function customPayrateValication(value) {
    if (!checkRegex(value, positiveNum)) {
        throw new Error('Payrate has to be postive number');
    }
    return true;
}
