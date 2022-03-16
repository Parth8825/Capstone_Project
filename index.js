// import express
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
//setting up express validator
const { check, validationResult } = require('express-validator');// ES6 standard for destructuring an object
// get expression session
const session = require('express-session');

// set up DataBase connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/CapstoneProject', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// set up the model to store employee data
const Employee = mongoose.model('Employee', {
    name: String,
    email: String,
    phone: String,
    address: String,
    postcode: String,
    position: String,
    payrate: Number
})
// set up the model for admin
const Admin = mongoose.model('Admin', {
    username: String,
    password: String
});

// set up variables to use packages
// create an express
var ourApp = express();
// parse application/x-www-form-urlencoded
ourApp.use(bodyParser.urlencoded({ extended: false }));
// set up session
ourApp.use(session({
    secret: 'superrandomsecret',
    resave: false,
    saveUninitialized: true
}));

// set up the path to public folder and views
ourApp.set('views', path.join(__dirname, 'views'));
// set up the path for public stuff like CSS and javascript
ourApp.use(express.static(__dirname + '/public'));

// define the view engine
ourApp.set('view engine', 'ejs');

// handle the HTTP requests


// Home page (Employee page)
ourApp.get('/', function (req, res) {
    //res.send('this one was showing in the browser');
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('employee', { employees: employees });
            }

        });
    }
    else {
        res.redirect('/login');
    }
});
// Add Employee page
ourApp.get('/addEmployee', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('addEmployee');
    }
    else {
        res.redirect('/login');
    }
});

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
// Add employee details
ourApp.post('/addEmployee', [
    check('firstname', 'First name is required').not().isEmpty(),
    check('lastname', 'Last name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('postcode').custom(customPostcodeValidation),
    check('payrate').custom(customPayrateValication)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('addEmployee', {
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
        res.redirect('/');
        // To display employee data
        // res.render('employee', employeeData);
    }


});
// edit employee details [get]
ourApp.get('/edit/:employeeId', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        var employeeId = req.params.employeeId;
        console.log(employeeId);
        Employee.findOne({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
            if (employee) {
                res.render('editEmployee', { employee: employee });
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
ourApp.post('/edit/:id', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('postcode').custom(customPostcodeValidation),
    check('payrate').custom(customPayrateValication)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var employeeId = req.params.employeeId;
        console.log(employeeId);
        Employee.findOne({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
          
            res.render('editEmployee', { employee: employee, errors: errors.array()});
          
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
        res.render('editedEmployeeDetail', employeeData);

    }
});

// delete employee data from database
ourApp.get('/delete/:employeeId', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        var employeeId = req.params.employeeId;
        console.log(employeeId);
        Employee.findByIdAndDelete({ _id: employeeId }).exec(function (err, employee) {
            console.log('Error: ' + err);
            console.log('Employee: ' + employee);
            res.redirect('/');
        });
    }
    else {
        res.redirect('/login');
    }
});

// schedule page
ourApp.get('/schedule', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('schedule');
    }
    else {
        res.redirect('/login');
    }

});
// Pay stub page
ourApp.get('/paystub', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('paystub');
    }
    else {
        res.redirect('/login');
    }

});
// Inventory page
ourApp.get('/inventory', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('inventory');
    }
    else {
        res.redirect('/login');
    }

});
// Attendance page
ourApp.get('/attendance', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('attendance');
    }
    else {
        res.redirect('/login');
    }

});
// login page
ourApp.get('/login', function (req, res) {
    res.render('login');
});
// login form
ourApp.post('/login', function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;

    Admin.findOne({ username: user, password: pass }).exec(function (err, admin) {
        console.log('Error: ' + err);
        console.log('Adming: ' + admin);
        if (admin) {
            // store username in session and set logged in true
            req.session.username = admin.username;
            req.session.userLoggedIn = true;
            // redirect to the dashboard
            res.redirect('/');
        }
        else {
            res.render('login', { error: 'Soory, cannot login!' });
        }
    });

});
// sign-up form
ourApp.post('/signup', [
    check('newUsername', 'username is required').not().isEmpty(),
    check('newEmail', 'E-mail is required').isEmail(),
    check('newPassword', 'password is required').not().isEmpty()
], function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('login', {
            errors: errors.array()
        });
    }
});

// logout process
ourApp.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send("Error")
        }
        else {
            res.render('login', { logout: "logout successfully....!" })
        }
    })
})

// listen for request at port 8080
ourApp.listen(8080);

// just printing execution successful
console.log("execute successfully: localhost:8080");
