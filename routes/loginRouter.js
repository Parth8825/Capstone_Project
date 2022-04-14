const express = require('express');
const bcrypt = require('bcrypt'); // for password encryption
var router = express.Router();
module.exports = router;
// getting models
const Admin = require('../models/adminModel');
const Otp = require('../models/otpModel'); 
//setting up express validator
const { check, validationResult } = require('express-validator');

//login page
router.get('/login', function (req, res) {
  if (req.session.userLoggedIn) {
      res.redirect('/');
  }
  else {
      res.render('login');
  }
});
// login user
router.post('/login',[
  check('username', 'username is required in Login').not().isEmpty(),
  check('password', 'password is required in Login').not().isEmpty()
], async function (req, res) {
  const errors = validationResult(req);
  try{
      if (!errors.isEmpty()) {
          res.render('login', {
              errors: errors.array()
          });
      }
      else{
          var user = req.body.username;
          var pass = req.body.password;
          Admin.findOne({ username: user}).exec(async function (err, admin) {
              console.log('Error: ' + err);
              console.log('Admin: ' + admin);
              if(!admin){
                  return res.render('login', { loginError: 'Sorry, cannot find user !!' });
              }
              try{
                  if(await bcrypt.compare(pass, admin.password)){
                      // store username in session and set logged in true
                      req.session.username = admin.username;
                      req.session.userLoggedIn = true;
                      // redirect to the dashboard
                      res.redirect('/');
                  }
                  else {
                  res.render('login', { loginError: 'Sorry, password is incorrect' });
                  }
              }
              catch{
                  res.status(500).send();
              }
          });
      } 
  }
  catch{
      res.status(500).send();
  }
  
});

// sign-up form
router.get('/signup', function(req, res){
    if (req.session.userLoggedIn) {
        res.redirect('/');
    }
    else {
        res.render('login');
    }
});
// sign-up form
router.post('/signup', [
  check('newUsername').custom(customUserNameValidation),
  check('newEmail', 'Please enter valid Email-Id').isEmail(),
  check('newPassword', 'Password is required').not().isEmpty()
],async function (req, res) {
  const errors = validationResult(req);
  try{
      if (!errors.isEmpty()) {
          res.render('login', {
              errors: errors.array()
          });
      }
      else{
          var newUser = req.body.newUsername;
          var newEmail = req.body.newEmail;

          let adminName = await Admin.findOne({ username: newUser});
          if(adminName){
                if(adminName.mail == newEmail){
                    return res.render('login', { loginError: 'User name & Email ID already exist, try different one' });
                }
                return res.render('login', { loginError: 'User under this name already exist, try different name' });
          }

          let adminEmail = await Admin.findOne({ mail: newEmail});
          if(adminEmail){
                return res.render('login', { loginError: 'Email ID already exist, try different Email ID' });
          }
          //creates a salt to generate new hash value every time.
          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(req.body.newPassword, salt); //converts password into hashcode and store into hashedPassword
          var newPassword = hashedPassword;
  
          var loginData = {
              username: newUser,
              mail: newEmail,
              password: newPassword
          }
          
          var userLoginData = new Admin(loginData);
          userLoginData.save().then(function (){
              console.log('Login data saved');
          });
          res.render('login', { message: "Singed up  successfully....!" });
      }
  }
  catch{
      res.status(500).send();
  }
  
});
// logout process
router.get('/signup', function (req, res) {
  if (req.session.userLoggedIn) {
      res.redirect('/');
  }
  else {
      res.render('login');
  }
});
// logout process
router.get('/logout', function (req, res) {
  if (req.session.userLoggedIn) {
      req.session.destroy(function (err) {
          if (err) {
              console.log(err);
              res.send("Error")
          }
          else {
             res.render('login', { message: "logout successfully....!" });
          }
      });
  }
  else {
      res.redirect('/login');
  }
  
});

// verify email process [GET]
router.get('/verifyEmail', function (req, res) {
  res.render('changePassword/verifyEmail');
});
// verify email process [POST]
router.post('/verifyEmail', [
    check('yourEmail', 'Email is required').not().isEmpty(),
],async function (req, res) {
    const errors = validationResult(req);
    try{
        if (!errors.isEmpty()) {
            res.render('changePassword/verifyEmail', {
                errors: errors.array()
            });
        }
        else{
          let emailid = req.body.yourEmail;
          let email = await Admin.findOne({mail: emailid});
          if(email){
              let otpcode = Math.floor((Math.random()*10000)+1);
              let otpData = new Otp({
                  mail: emailid,
                  code: otpcode,
                  expireIn: new Date().getTime() + 300*1000
              });
              let otpResponse = await otpData.save();
              mailer(emailid,otpcode); // calling an object
              res.render('changePassword/resetPassword', otpResponse);
              console.log('Success !!! Please check your email id')
          }
          else {
              res.render('changePassword/verifyEmail', {error: 'email id not exist, please enter valid mail id'});
          }
        }
    }catch{
        res.status(500).send();
    }
});

// object which is going to send the mail to the client to get the OTP 
const mailer = (email, otp)=>{
  const nodemailer = require('nodemailer');
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
          user: 'teamprtproject@gmail.com',
          pass: 'info2310teamprt'
      }
  });
  
  let mailOptions = {
      from: 'teamprtproject@gmail.com',
      to: email,
      subject: 'Here is your OTP, Please don\'t reply ',
      text: `Thank you sir ! \n Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, function(err, info){
      if(err){
          console.log(error);
      }   else{
          console.log('Email send: ' + info.response );
      }
  });
}

// change password process
router.post('/resetPssword', [
    check('otp', 'OTP is required').not().isEmpty(),
    check('resetPassword', 'Password is required').not().isEmpty()
],async function (req, res) {
    const errors = validationResult(req);
    try{
        if (!errors.isEmpty()) {
            res.render('changePassword/resetPassword', {
                errors: errors.array()
            });
        }
        else{
            Otp.findOne({code: req.body.otp}).exec(async function (err, otp) {
    
                if(otp){
                    let currentTime = new Date().getTime();
                    let diff = otp.expireIn - currentTime;
                    if(diff < 0){
                        res.render('changePassword/resetPassword',  {error: 'Token Exprired'})
                    }else{
                        var mail = otp.mail;
                        const newSalt = await bcrypt.genSalt();
                        const hashedResetPassword = await bcrypt.hash(req.body.resetPassword, newSalt);
                        Admin.findOne({mail: mail}).exec(async function (err, admin) {
                            admin.password = hashedResetPassword;
                            admin.save();
                            console.log('New password saved');
                            res.redirect('/login');
                        });
                        
                    }
                }
                else{
                    res.render('changePassword/resetPassword',  {error: 'Invalid OTP'})
                }
            });
        }
    }
    catch{
        res.status(500).send();
    }
    
});

// Validations
// Defining regular expressions
var latterAndThenNumberRegex = /^[a-zA-Z]*\d*$/;
// function to check a value using regular expression
function checkRegex(userInput, regex) {
  if (regex.test(userInput)) {
      return true;
  }
  else {
      return false;
  }
}
// custome sign-up user name validation
function customUserNameValidation(value){
  if(value === ''){
      throw new Error('User name is required');
  }else if(!checkRegex(value, latterAndThenNumberRegex)){
      throw new Error('First should be character then numeric value Ex. John123');
  }
  return true;
}