// import express
const express =  require('express');
const path = require('path');
const bodyParser = require('body-parser');

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
    res.render('employee');
});
// Add Employee page
ourApp.get('/addEmployee',function(req,res){
    res.render('addEmployee');
});

// Post employee details
ourApp.post('/addEmployee', function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var postcode = req.body.postcode;
    var position = req.body.position;
    var payrate = req.body.payrate;

    //storing values in object called "employeeData"
    var employeeData = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        postcode: postcode,
        position: position,
        payrate: payrate
    }
    res.render('addEmployee', employeeData);
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
