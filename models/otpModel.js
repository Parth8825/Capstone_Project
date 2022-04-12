const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    mail: String,
    code: String,
    exprireIn: Number
});

module.exports = mongoose.model('OTPSchema', OTPSchema);