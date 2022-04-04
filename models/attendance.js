const mongoose = require('mongoose');

const Attendance = new mongoose.Schema({
    eName: String,
    date: Date,
    sDay: String,
    attendance: String 
});

module.exports = mongoose.model('Attendance', Attendance)