//import express
const { fuchsia } = require('color-name');
var express =  require('express');
var path = require('path');

//create an expres
var ourApp = express();

//set up the path to public folder and views
ourApp.set('views',path.join(__dirname,'views'));

//set up the path for public stuff like CSS and javascript
ourApp.use(express.static(__dirname + '/public'));

//define the view engine
ourApp.set('view engine', 'ejs');

//handle the HTTP requests


// Home page (Employee page)
ourApp.get('/',function(req,res){
    //res.send('this one was showing in the browser');
    res.render('employee');
});
// Add Employee page
ourApp.get('/addEmployee',function(req,res){
    res.render('addEmployee');
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
//listen for request at port 8080
ourApp.listen(8825);

//just printing execution successful
console.log("execute successfully: localhost:8080");
