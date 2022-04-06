var express = require('express');
var router = express.Router();
module.exports = router;

// Pay stub page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('paystub/paystub', { admin: req.session.username });
    }
    else {
        res.redirect('/login');
    }
});

// generate paystub page [GET]
router.get('/generatePaystub', function(req, res){
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('paystub/generatePaystub');
    }
    else {
        res.redirect('/login');
    }
})