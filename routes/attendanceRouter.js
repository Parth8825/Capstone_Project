var express = require('express');
var router = express.Router();
module.exports = router;

// Attendance page
router.get('/', function (req, res) {
    // check if thr user is logged in 
    if (req.session.userLoggedIn) {
        res.render('attendance/attendance');
    }
    else {
        res.redirect('/login');
    }

});