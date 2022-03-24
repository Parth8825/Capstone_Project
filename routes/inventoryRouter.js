var express = require('express');
var router = express.Router();
module.exports = router;

// Inventory page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('inventory/inventory');
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