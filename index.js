// import express
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // MongoDB connection
// get expression session
const session = require('express-session');
// get cookies 
const cookieParse = require('cookie-parser');
// uuid module to create Hash string (v4 means Version 4)
const {v4: uuidv4} = require('uuid');
// flash message
const flash = require('connect-flash');
// get router
const mainRouter = require('./routes/mainRouter');
const loginRouter = require('./routes/loginRouter');
const invnetoryRouter = require('./routes/inventoryRouter');
const scheduleRouter = require('./routes/scheduleRouter');
const attendanceRouter = require('./routes/attendanceRouter');
const paystubRouter = require('./routes/paystubRouter');

require('dotenv').config();

// set up DataBase connection
const mongoString = process.env.MONGO_DATABASE_URL;
mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const database = mongoose.connection
database.on('error', (error) => {
    console.log(error)
});
database.once('connected', () => {
    console.log('Database Connected');
});
// set up variables to use packages
// create an express
var ourApp = express();
// parse application/x-www-form-urlencoded
ourApp.use(bodyParser.urlencoded({ extended: false }));
ourApp.use(bodyParser.json());
// set up cookies
ourApp.use(cookieParse(uuidv4()));

// set up session
ourApp.use(session({
    // uuid will provide unique Hash code for secret session
    secret: uuidv4(), // '1b9d6bcd-bbfd-4b3s-9d6f-sd6sdffe6dx'
    // cookie: { maxAge: 600000},
    resave: false,
    saveUninitialized: true
}));

// set up flash for messages
ourApp.use(flash());
// set up router
ourApp.use('/', mainRouter);
ourApp.use('/', loginRouter);
ourApp.use('/inventory', invnetoryRouter);
ourApp.use('/schedule', scheduleRouter);
ourApp.use('/attendance', attendanceRouter);
ourApp.use('/paystub', paystubRouter);

// set up the path to public folder and views
ourApp.set('views', path.join(__dirname, 'views'));
// set up the path for public stuff like CSS and javascript
ourApp.use(express.static(__dirname + '/public'));
// define the view engine
ourApp.set('view engine', 'ejs');

// port number
const port = process.env.PORT || 8080;
// listen for request at port 8080
ourApp.listen(port);
// just printing execution successful
console.log("executed successfully: http://localhost:8080/");
