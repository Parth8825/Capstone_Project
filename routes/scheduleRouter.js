var express = require('express');
var router = express.Router();
module.exports = router;

const Employee = require('../models/employeeModel');
const Schedule = require('../models/scheduleModel');

//setting up express validator
const { check, validationResult } = require('express-validator');

// SCHEDULE PAGE 
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

// ADD SCHEDULE PAGE [get]
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

// ADD SCHEDULE PAGE [post]
router.post('/addSchedule', [
    check('eName').custom(customChecksNameSelected),
    check('sDay').custom(customChecksDaySelected),
    check('startTime').custom(customChecksStartTimeSelected),
    check('endTime').custom(customChecksEndTimeSelected),
    check('startTime').custom(checkStartTimeEndTimeNotSame)
], function (req, res) {
    const errors = validationResult(req);
   
    if (!errors.isEmpty()) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                
                res.render('schedule/addSchedule', {employees: employees, errors: errors.array()});
                return;
            }
        });
    }
    else {
        var employeeName = req.body.eName;
        var dayPick = req.body.sDay;
        var startTime = req.body.startTime;
        var endTime= req.body.endTime;

        var scheduleData = {
            employeeName: employeeName,
            day: dayPick,
            startTime: startTime,
            endTime: endTime
        }

        var ourSchedule = new Schedule(scheduleData);
        ourSchedule.save().then(function(){
            console.log('Schedule saved successfully');
        });
        req.flash('msg', 'Schedule Added successfully !!!');
        res.redirect('/schedule');
    }
});

// EDIT SCHEDULE DETAILS [GET]
router.get('/edit/:scheduleId', function (req, res) {
    // check if the user is logged in 
    if (req.session.userLoggedIn) {
        var scheduleId = req.params.scheduleId;
        console.log(scheduleId);

        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                Schedule.findOne({ _id: scheduleId }).exec(function (err, schedule) {
                    console.log('Error: ' + err);
                    console.log('Schedule: ' + schedule);
                    if (schedule) {
                        res.render('schedule/editSchedule', { schedule: schedule, employees: employees });
                    }
                    else {
                        res.send('No Schedule found with that id..');
                    }
                });
            }
        });  
    }
    else {
        res.redirect('/login');
    }
});

// EDIT SCHEDULE DETAILS [POST]
router.post('/edit/:id', [
    check('eName').custom(customChecksNameSelected),
    check('sDay').custom(customChecksDaySelected),
    check('startTime').custom(customChecksStartTimeSelected),
    check('endTime').custom(customChecksEndTimeSelected),
    check('startTime').custom(checkStartTimeEndTimeNotSame)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var scheduleId = req.params.id;
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                Schedule.findOne({ _id: scheduleId }).exec(function (err, schedule) {
                    console.log('Error: ' + err);
                    console.log('Schedule: ' + schedule);
                    if(schedule){
                        res.render('schedule/editSchedule', { schedule:schedule, employees: employees, errors: errors.array()});
                    }
                    else{
                        res.send('No Schedule found with that id...');
                    }
                });
            }
        }); 
    }
    else {
        var employeeName = req.body.eName;
        var dayPeek = req.body.sDay;
        var startTime = req.body.startTime;
        var endTime= req.body.endTime;

        // storing values in object called "scheduleData"
        var scheduleData = {
            employeeName: employeeName,
            day: dayPeek,
            startTime: startTime,
            endTime: endTime
        }

        var id = req.params.id;
        Schedule.findOne({ _id: id }, function (err, schedule) {
            schedule.employeeName = employeeName;
            schedule.dayPeek = dayPeek;
            schedule.startTime = startTime;
            schedule.endTime = endTime;

            schedule.save().then(function () {
                console.log('Schedule updated');
            });
        });
        res.render('schedule/editedScheduleDetail', scheduleData);

    }
});


//DELETE SCHEDULE METHOD
router.get('/delete/:id', function (req, res){
    if (req.session.userLoggedIn) {
        var scheduleId = req.params.id;
        console.log(scheduleId);
        Schedule.findByIdAndDelete({_id: scheduleId}).exec(function (err, schedule){
            console.log('Error: ' + err);
            console.log('Schedule: ' + schedule);
        });
        req.flash('msg', 'Schedule deleted successfully !!!');
        res.redirect('/schedule');
    }
    else {
        res.redirect('/login');
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

function customChecksStartTimeSelected(value){
    if(value === '---Start Time---'){
        throw new Error('Please select start time');
    }
    return true;
}
function customChecksEndTimeSelected(value){
    if(value === '---End Time---'){
        throw new Error('Please select end time');
    }
    return true;
}

function checkStartTimeEndTimeNotSame(value, {req, loc, path} ){
    if(value == req.body.endTime){
        throw new Error('Start time and End time can not be same');
    }
    return true;
}
