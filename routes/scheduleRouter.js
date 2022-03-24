var express = require('express');
var router = express.Router();
module.exports = router;

// schedule page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('schedule/schedule');
    }
    else {
        res.redirect('/login');
    }

});