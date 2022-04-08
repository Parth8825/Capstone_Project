const mongoose = require('mongoose');

const Paystub = new mongoose.Schema({
    employeeName: String,
    weeklyHours: String,
    email: String,
    payrate: Number,
    grossPay: Number,
    taxes: Number,
    takeHome: Number  
});

module.exports = mongoose.model('Paystub', Paystub);