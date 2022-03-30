var express = require('express');
var router = express.Router();
module.exports = router;

//IMPORTING inventoryModel FROM THE MODEL FOLDER
const Inventory = require('../models/inventoryModel')

//setting up express validator
const { check, validationResult } = require('express-validator');
const e = require('connect-flash');

// Inventory page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        Inventory.find({}).exec(function (err, inventories) {
            if (err) {
                res(err)
            }
            else {
                const message = req.flash('msg');
                res.render('inventory/inventory', { inventories: inventories, message});
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// ADD ITEM IN INVENTORY
router.get('/addInventory', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('inventory/addInventory');
    }
    else {
        res.redirect('/login');
    }
});

// ADD ITEM IN INVENTORY
router.post('/addInventory', [
    check('itemname', 'Item name is required').not().isEmpty(),
    check('addedby', 'Added by whom is required').not().isEmpty(),
    check('quantity').custom(customQuantityValication),
    check('rate').custom(customRateValication),
    check('remaineditem').custom(customremainedItemValication)

], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('inventory/addInventory', {
            errors: errors.array()
        });
    }
    else {
        var itemname = req.body.itemname;
        var quantity = req.body.quantity;
        var rate = req.body.rate;
        var addedby = req.body.addedby;   
        receiveddatetime = req.body.receiveddatetime;
        var remaineditem = req.body.remaineditem;
        var description = req.body.description;

        // storing values in object called "employeeData"
        var inventoryData = {
            itemname: itemname,
            quantity: quantity,
            rate: rate,
            addedby: addedby,
            receiveddatetime: receiveddatetime,
            remaineditem: remaineditem,
            description: description
        }
        // create an object for the model Employee
        var ourInventory = new Inventory(inventoryData);
        ourInventory.save().then(function () {
            console.log('New Item in Inventory added');
        });
        req.flash('msg', 'Item added successfully !!!');
        res.redirect('/inventory');
    }
});

// EDIT INVENTORY DETAILS [GET]
router.get('/edit/:inventoryId', function (req, res) {
    // check if the user is logged in 
    if (req.session.userLoggedIn) {
        var inventoryId = req.params.inventoryId;
        console.log(inventoryId);
        Inventory.findOne({ _id: inventoryId }).exec(function (err, inventory) {
            console.log('Error: ' + err);
            console.log('Inventory: ' + inventory);
            if (inventory) {
                res.render('inventory/editInventory', { inventory: inventory });
            }
            else {
                res.send('No Inventory found with that id..');
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// EDIT INVENTORY DETAILS [POST]
router.post('/edit/:id', [
    check('itemname', 'Item name is required').not().isEmpty(),
    check('addedby', 'Added by whom is required').not().isEmpty(),
    check('quantity').custom(customQuantityValication),
    check('rate').custom(customRateValication),
    check('remaineditem').custom(customremainedItemValication)

], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var inventoryId = req.params.id;
        Inventory.findOne({ _id: inventoryId }).exec(function (err, inventory) {
            console.log('Error: ' + err);
            console.log('Inventory: ' + inventory);
            if(inventory){
                res.render('inventory/editInventory', { inventory:inventory, errors: errors.array()});
            }
            else{
                res.send('no order found with that id...');
            }
        
        });
    }
    else {
        var itemname = req.body.itemname;
        var quantity = req.body.quantity;
        var rate = req.body.rate;
        var addedby = req.body.addedby;   
        var receiveddatetime = req.body.receiveddatetime;
        var remaineditem = req.body.remaineditem;
        var description = req.body.description;

        // storing values in object called "employeeData"
        var inventoryData = {
            itemname: itemname,
            quantity: quantity,
            rate: rate,
            addedby: addedby,
            receiveddatetime: receiveddatetime,
            remaineditem: remaineditem,
            description: description
        }

        var id = req.params.id;
        Inventory.findOne({ _id: id }, function (err, inventory) {
            inventory.itemname = itemname;
            inventory.quantity = quantity;
            inventory.rate = rate;
            inventory.addedby = addedby;
            inventory.receiveddatetime = receiveddatetime;
            inventory.remaineditem = remaineditem;
            inventory.description = description;
            inventory.save().then(function () {
                console.log('Inventory updated');
            });
        });
        res.render('inventory/editedInventoryDetail', inventoryData);

    }
});

// DELETE INVENTORY ITEM FROM THE DATABASE
router.get('/delete/:inventoryId', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        var inventoryId = req.params.inventoryId;
        console.log(inventoryId);
        Inventory.findByIdAndDelete({ _id: inventoryId }).exec(function (err, inventory) {
            console.log('Error: ' + err);
            console.log('Item: ' + inventory);
        });
        req.flash('msg', 'Item from Inventory deleted successfully !!!');
        res.redirect('/inventory');
    }
    else {
        res.redirect('/login');
    }
});

// Validations
// Defining regular expressions
var positiveNum = /^[1-9][0-9]*$/;

// function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

// custom quantity validation function
function customQuantityValication(value) {
    if (!checkRegex(value, positiveNum)) {
        throw new Error('Quantity has to be postive number');
    }
    return true;
}

function customRateValication(value) {
    if (!checkRegex(value, positiveNum)) {
        throw new Error('Rate has to be postive number');
    }
    return true;
}

function customremainedItemValication(value) {
    if (!checkRegex(value, positiveNum)) {
        throw new Error('Remaied Item has to be postive number');
    }
    return true;
}