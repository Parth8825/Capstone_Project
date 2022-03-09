// import express
const express =  require('express');
const path = require('path');
const bodyParser = require('body-parser');
//setting up express validator
const {check, validationResult} = require('express-validator');// ES6 standard for destructuring an object

// set up DataBase connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/CapstoneProject',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// set up the model to store employee data
const Employee= mongoose.model('Employee',{
    name: String,
    email: String,
    phone: String,
    address: String,
    postcode: String,
    position: String,
    payrate: Number
})
// set up variables to use packages
// create an express
var ourApp = express();
// parse application/x-www-form-urlencoded
ourApp.use(bodyParser.urlencoded({extended: false}));

// set up the path to public folder and views
ourApp.set('views',path.join(__dirname,'views'));
// set up the path for public stuff like CSS and javascript
ourApp.use(express.static(__dirname + '/public'));

// define the view engine
ourApp.set('view engine', 'ejs');

// handle the HTTP requests


// Home page (Employee page)
ourApp.get('/',function(req,res){
    //res.send('this one was showing in the browser');
    Employee.find({}).exec(function(err,employees){
        res.render('employee', {employees: employees});
    });
});
// Add Employee page
ourApp.get('/addEmployee',function(req,res){
    res.render('addEmployee');
});

// Defining regular expressions
var phoneRegex = /^[0-9]{10}$/;
var positiveNum = /^[1-9][0-9]*$/;
var postcoderegex = /^[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]$/;

// function to check a value using regular expression
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}  
// custom phone number validation function
function customPhoneValidation(value){
    if(!checkRegex(value, phoneRegex)){
        throw new Error('Number has to be in 10 digits');
    }
    return true;
}
// custom postcode validation function
function customPostcodeValidation(value){
    if(!checkRegex(value, postcoderegex)){
        throw new Error('Postcode should be X0X 0X0');
    }
    return true;
} 
// custom payrate validation function
function customPayrateValication(value){
    if(!checkRegex(value, positiveNum)){
        throw new Error('Payrate has to be postive number');
    }
    return true;
}
// Post employee details
ourApp.post('/addEmployee', [
    check('firstname', 'First name is required').not().isEmpty(),
    check('lastname', 'Last name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('postcode').custom(customPostcodeValidation),
    check('payrate').custom(customPayrateValication)
],function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('addEmployee',{
            errors:errors.array()
        });
    }
    else{
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
        ourEmployees.save().then(function(){
            console.log('New Employee created');
        });
        // To display employee data
        res.render('addEmployee', employeeData);
    }
    
});

// schedule page
ourApp.get('/schedule',function(req,res){
    res.render('schedule');
});
// Pay stub page
ourApp.get('/paystub',function(req,res){
    res.render('paystub');
});
// Inventory page
ourApp.get('/inventory',function(req,res){
    res.render('inventory');
});
// Attendance page
ourApp.get('/attendance',function(req,res){
    res.render('attendance');
});


// listen for request at port 8080
ourApp.listen(8080);

// just printing execution successful
console.log("execute successfully: localhost:8080");
