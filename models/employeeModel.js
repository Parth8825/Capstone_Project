const mongoose = require('mongoose');

const Employee = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    postcode: String,
    position: String,
    payrate: Number
});

module.exports = mongoose.model('Employee', Employee)