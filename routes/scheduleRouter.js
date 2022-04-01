var express = require('express');
var router = express.Router();
module.exports = router;

const Employee = require('../models/employeeModel');
const Schedule = require('../models/scheduleModel');
// schedule page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Schedule.find({}).exec(function (err, schedules){
            if(err){
                res(err)
            }
            else {
                const message = req.flash('msg');
                res.render('schedule/schedule', {schedules: schedules, message});
            }
        });
    }
    else {
        res.redirect('/login');
    }

});

// Add schedule page
router.get('/addSchedule', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('schedule/addSchedule', {employees: employees});
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/addSchedule', function (req, res) {
    var employeeName = req.body.eName;
    var dayPeek = req.body.sDay;
    var startTime = req.body.startTime;
    var endTime= req.body.endTime;

    var scheduleData = {
        employeeName: employeeName,
        day: dayPeek,
        startTime: startTime,
        endTime: endTime
    }

    var ourSchedule = new Schedule(scheduleData);
    ourSchedule.save().then(function(){
        console.log('Schedule saved successfully');
    });
    req.flash('msg', 'Schedule added successfully !!!');
    res.redirect('/schedule');
});
