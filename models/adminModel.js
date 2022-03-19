const mongoose = require('mongoose');

// set up the model to store employee data
const Admin = new mongoose.Schema({
    username: String,
    mail: String,
    password: String
});



module.exports = mongoose.model('Admin', Admin)