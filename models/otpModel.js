const mongoose = require('mongoose');
const OTPSchema = new mongoose.Schema({
    mail: { type: String, required: true },
    challenge: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
    attempts: { type: Number, default: 0 }
});
module.exports = mongoose.model('OTPSchema', OTPSchema);
