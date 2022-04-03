var express = require('express');
var router = express.Router();
module.exports = router;

const Employee = require('../models/employeeModel');
const Attendance = require('../models/attendance');

//setting up express validator
const { check, validationResult } = require('express-validator');
const { validate } = require('../models/employeeModel');
// Attendance page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Attendance.find({}).exec(function (err, attendances){
            if(err){
                res(err)
            }
            else {
                const message = req.flash('msg');
                res.render('attendance/attendance', {attendances: attendances, message});
            }
        });    }
    else {
        res.redirect('/login');
    }

});

// ADD ATTENDANCE PAGE [get]
router.get('/addAttendance', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Employee.find({}).exec(function (err, employees){
            if(err){
                res(err)
            }
            else {
                res.render('attendance/addAttendance', {employees: employees});
            }
        });
    }
    else {
        res.redirect('/login');
    }

});

// ADD SCHEDULE PAGE [post]
router.post('/addAttendance', [
    check('eName').custom(customChecksNameSelected),
    check('date', 'Date is Required').not().isEmpty(),
    check('sDay').custom(customChecksDaySelected),
    check('attendance').custom(customCheckAttendance)
], function (req, res) {
    const errors = validationResult(req);
   
    if (!errors.isEmpty()) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                
                res.render('attendance/addAttendance', {employees: employees, errors: errors.array()});
                return;
            }
        });
    }
    else {
        var employeeName = req.body.eName;
        var dayPick = req.body.sDay;
        var date = req.body.date
        var attendance = req.body.attendance;

        var attendanceData = {
            employeeName: employeeName,
            day: dayPick,
            date: date,
            attendance: attendance
        }

        var takeAttendance = new Attendance(attendanceData);
        takeAttendance.save().then(function(){
            console.log('Attedance saved successfully');
        });
        req.flash('msg', 'Attendance Added successfully !!!');
        res.redirect('/attendance');
    }
});

// custome schedule validations
function customChecksNameSelected(value){
    if(value === '---Select Employee---'){
        throw new Error('Please select employee name');
    }
    return true;
}

function customChecksDaySelected(value){
    if(value === '---Select Day---'){
        throw new Error('Please select day');
    }
    return true;
}

function customCheckAttendance(value){
    if(value === '---Take Attendnace---'){
        throw new Error('Please select Present OR Absent');
    }
    return true;
}