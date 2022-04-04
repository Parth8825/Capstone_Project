const mongoose = require('mongoose');

const Inventory = new mongoose.Schema({
    itemname: String,
    quantity: Number,
    rate: Number,
    addedby: String,
    receiveddatetime: String,
    remaineditem: Number,
    description: String
});

module.exports = mongoose.model('Inventory', Inventory)