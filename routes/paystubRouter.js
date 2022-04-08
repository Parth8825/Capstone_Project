var express = require('express');
var router = express.Router();
module.exports = router;

const Paystub = require('../models/paystubModel');
const Employee = require('../models/employeeModel');
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
                res.render('paystub/paystub', { paystubs: paystubs, admin: req.session.username });
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
router.post('/generatePaystub', function(req, res){
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
            var employeeName = "";
            var email = "";
            var payrate = "";
            var grossPay = "";
            var taxes = "";
            var takeHome = "";
            Employee.findOne({_id: employeeNameId}).exec(function(err, employee){
                employeeName = employee.name;
                email = employee.email;
                payrate = employee.payrate;
                grossPay = weeklyHours * payrate;
                taxes = (grossPay * 13)/ 100;
                takeHome = grossPay - taxes;
        
                var payStubData = {
                    employeeName: employeeName,
                    weeklyHours: weeklyHours,
                    email: email,
                    payrate: payrate,
                    grossPay: grossPay,
                    taxes: taxes,
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