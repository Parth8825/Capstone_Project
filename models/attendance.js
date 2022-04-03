const mongoose = require('mongoose');

const Attendance = new mongoose.Schema({
    employeeName: String,
    date: Date,
    day: String,
    attendance: String 
});

module.exports = mongoose.model('Attendance', Attendance)