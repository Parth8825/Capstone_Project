const mongoose = require('mongoose');

const Schedule = new mongoose.Schema({
    employeeName: String,
    day: String,
    startTime: String,
    endTime: String  
});

module.exports = mongoose.model('Schedule', Schedule)