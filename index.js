// import express
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// get expression session
const session = require('express-session');
// uuid module to create Hash string (v4 means Version 4)
const {v4: uuidv4} = require("uuid");
// set up router
const router = require('./routes/router');

// set up DataBase connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/CapstoneProject', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const database = mongoose.connection
database.on('error', (error) => {
    console.log(error)
})
database.once('connected', () => {
    console.log('Database Connected');
})


// set up variables to use packages
// create an express
var ourApp = express();
// parse application/x-www-form-urlencoded
ourApp.use(bodyParser.urlencoded({ extended: false }));
// set up session
ourApp.use(session({
    secret: uuidv4(), // '1b9d6bcd-bbfd-4b3s-9d6f-sd6sdffe6dx'
    resave: false,
    saveUninitialized: true
}));
// using router
ourApp.use('/', router);


// set up the path to public folder and views
ourApp.set('views', path.join(__dirname, 'views'));
// set up the path for public stuff like CSS and javascript
ourApp.use(express.static(__dirname + '/public'));

// define the view engine
ourApp.set('view engine', 'ejs');

// listen for request at port 8080
ourApp.listen(8080);

// just printing execution successful
console.log("execute successfully: http://localhost:8080/");
