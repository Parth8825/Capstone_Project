const mongoose = require('mongoose');

const Attendance = new mongoose.Schema({
    eName: String,
    date: String,
    sDay: String,
    attendance: String 
});

module.exports = mongoose.model('Attendance', Attendance)