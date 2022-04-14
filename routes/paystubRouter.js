var express = require('express');
var router = express.Router();
module.exports = router;
// getting models
const Paystub = require('../models/paystubModel');
const Employee = require('../models/employeeModel');
const pdfService = require('../services/pdf_service');
const { check, validationResult } = require('express-validator');

// Pay stub page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Paystub.find({}).exec(function (err, paystubs) {
            if (err) {
                res(err)
            }
            else {
                const message = req.flash('msg');
                res.render('paystub/paystub', { paystubs: paystubs, message, admin: req.session.username });
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// generate paystub page [GET]
router.get('/generatePaystub', function(req, res){
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('paystub/generatePaystub', {employees: employees});
                }
            });
    }
    else {
        res.redirect('/login');
    }
});

// genrate paystub page [POST]
router.post('/generatePaystub', [
    check('name').custom(customChecksNameSelected),
    check('weeklyHours').custom(customWeekHoursValication)
],function(req, res){
    const errors = validationResult(req);
   
    if (!errors.isEmpty()) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('paystub/generatePaystub', {employees: employees, errors: errors.array()});
                return;
            }
        });
    }
    else {
        Employee.find({}).exec(function(err, employees){
            var employeeNameId = req.body.name.trim();
            var weeklyHours = req.body.weeklyHours;
            var date = req.body.date;
            var employeeName = "";
            var email = "";
            var payrate = "";
            var grossPay = "";
            var provincialTaxes = "";
            var cpp = "";
            var ei = "";
            var federalTaxes = "";
            var takeHome = "";
            Employee.findOne({_id: employeeNameId}).exec(function(err, employee){
                employeeName = employee.name;
                email = employee.email;
                payrate = employee.payrate;
                grossPay = weeklyHours * payrate;
                provincialTaxes = (grossPay * 5.05)/ 100;
                cpp = (grossPay * 5.70)/ 100;
                ei = (grossPay * 1.58)/ 100;
                federalTaxes = (grossPay * 15)/ 100;
                takeHome = grossPay - provincialTaxes - cpp - ei - federalTaxes;
                var payStubData = {
                    employeeName: employeeName,
                    weeklyHours: weeklyHours,
                    email: email,
                    date: date,
                    payrate: payrate,
                    grossPay: grossPay,
                    provincialTaxes: provincialTaxes,
                    cpp: cpp,
                    ei: ei,
                    federalTaxes: federalTaxes,
                    takeHome: takeHome
                }
                var ourPaystub = new Paystub(payStubData);
                ourPaystub.save().then(function(){
                    console.log('Paystub saved successfully');
                });
                //req.flash('msg', 'Schedule Added successfully !!!');
                res.render('paystub/displayPaystub', payStubData);
                
            });
        });
       
    }
});
// Creates PDF format [GET]
router.get('/paystubPrint/:id', function(req, res){
     // check if thr user is logged in 
     if (req.session.userLoggedIn) {
        var paystubId = req.params.id;
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment;filename=paystub.pdf'
          });
          pdfService.buildPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            paystubId
          );
    }
    else {
        res.redirect('/login');
    }
});
// Paystub information page [GET]
router.get('/paystubInfo/:id', function(req,res){
    if(req.session.userLoggedIn){
        var paystubId = req.params.id;
        Paystub.findOne({_id: paystubId}, function(err, paystub){
            if(paystub){
                res.render('paystub/paystubInfo', {paystub: paystub});
            }
            else{
                res.send("Sorry.... No data found");
            }
        })
    }
    else{
        res.redirect('/login');
    }
});


// custome validations
// Defining regular expressions
var positiveNum = /^[1-9][0-9]*$/;

// function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}
// custom name selected validation
function customChecksNameSelected(value){
    if(value === '---Select Employee---'){
        throw new Error('Please select employee name');
    }
    return true;
}

// custom week hours validation function
function customWeekHoursValication(value) {
    if(value == ''){
        throw new Error('week hours is required');
    }
    else if (!checkRegex(value, positiveNum)) {
        throw new Error('hours should be postive number');
    }
    return true;
}