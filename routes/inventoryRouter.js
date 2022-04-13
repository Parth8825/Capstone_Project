var express = require('express');
var router = express.Router();
module.exports = router;

//IMPORTING inventoryModel FROM THE MODEL FOLDER
const Inventory = require('../models/inventoryModel');
const Employee = require('../models/employeeModel');

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
                res.render('inventory/inventory', { inventories: inventories, message, admin: req.session.username});
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// ADD ITEM IN INVENTORY [get]
router.get('/addInventory', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        const form = {
            itemnameHolder: req.body.itemname,
            quantityHolder: req.body.quantity,
            rateHolder: req.body.rate,
            addedbyHolder: req.body.addedby,
            datetimeHolder: req.body.receiveddatetime,
            remaineditemHolder: req.body.remaineditem,
            descriptionHolder: req.body.description
        };
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('inventory/addInventory', {employees: employees, form: form});
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// ADD ITEM IN INVENTORY [post]
router.post('/addInventory', [
    check('itemname').custom(customItemNameValidation),
    check('quantity').custom(customQuantityValication),
    check('rate').custom(customRateValication),
    check('addedby', 'Added by whom is required').not().isEmpty(),
    check('addedby').custom(customChecksNameSelected),
    check('remaineditem').custom(customremainedItemValication),
    check('description', 'Description is required').not().isEmpty()
], function (req, res) {
    const form = {
        itemnameHolder: req.body.itemname,
        quantityHolder: req.body.quantity,
        rateHolder: req.body.rate,
        addedbyHolder: req.body.addedby,
        datetimeHolder: req.body.receiveddatetime,
        remaineditemHolder: req.body.remaineditem,
        descriptionHolder: req.body.description
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                res.render('inventory/addInventory', {employees: employees, form: form,
                    errors: errors.array()
                });
                return;
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
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                Inventory.findOne({ _id: inventoryId }).exec(function (err, inventory) {
                    console.log('Error: ' + err);
                    console.log('Inventory: ' + inventory);
                    if (inventory) {
                        res.render('inventory/editInventory', { inventory: inventory, employees: employees });
                    }
                    else {
                        res.send('No Inventory found with that id..');
                    }
                });
            }
        });
    }
    else {
        res.redirect('/login');
    }
});

// EDIT INVENTORY DETAILS [POST]
router.post('/edit/:id', [
    check('itemname').custom(customItemNameValidation),
    check('addedby', 'Added by whom is required').not().isEmpty(),
    check('addedby').custom(customChecksNameSelected),
    check('quantity').custom(customQuantityValication),
    check('rate').custom(customRateValication),
    check('remaineditem').custom(customremainedItemValication)
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var inventoryId = req.params.id;
        Employee.find({}).exec(function (err, employees) {
            if (err) {
                res(err)
            }
            else {
                Inventory.findOne({ _id: inventoryId }).exec(function (err, inventory) {
                    console.log('Error: ' + err);
                    console.log('Inventory: ' + inventory);
                    if(inventory){
                        res.render('inventory/editInventory', { inventory:inventory, employees: employees, errors: errors.array()});
                    }
                    else{
                        res.send('no order found with that id...');
                    }
                
                });
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
var onlyNameRegex = /^[a-zA-Z ]*$/;
// function to check a value using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

// custome item name validation
function customItemNameValidation(value){
    if(value === ''){
        throw new Error('Item name is required');
    }else if(!checkRegex(value, onlyNameRegex)){
        throw new Error('No special character or numeric values in Item name');
    }
    return true;
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

function customChecksNameSelected(value){
    if(value === '---Select Employee---'){
        throw new Error('Please select employee name');
    }
    return true;
}