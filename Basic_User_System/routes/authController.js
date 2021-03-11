const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../model/userSchema');
const config = require('../config/config');
const nodemailer = require("../config/nodemailer");
const session = require('express-session');
const path = require('path');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(express.static(path.join(__dirname,'../public')));

router.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
  
var passport = require('passport');
var userProfile;
 
router.use(passport.initialize());
router.use(passport.session());
 
router.get('/google/success', (req, res) => {
    Users.findOne({ email: req.user.emails[0].value }, (err, email) => {
        if (email) return res.status(400).render('userdash');
        Users.create({
            name: req.user.displayName,
            email: req.user.emails[0].value,
            ph_number: req.body.ph_number || null,
            address: req.body.address || null,
            isActive: true
            }, (err, user) => {
                if (err) throw err;
                res.status(200).render('userdash',{success:"Successful registered"});
        });
    });
});

router.get('/error', (req, res) => res.send("error logging in"));
 
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
 
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { reset } = require('nodemon');
const GOOGLE_CLIENT_ID = '762002577524-nrkq5e8pv526bvb4nr1ljh855htmg78h.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'qTAzJA88qgVhiHJHu-e_QEgR';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5678/api/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

router.get('/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('success');
  });

router.post('/signup', (req, res) => {
    hashpass = bcrypt.hashSync(req.body.password, 8);
    Users.findOne({ email: req.body.email }, (err, email) => {
        if (email) return res.status(400).render('signup',{error:{exist: "User Already Exist"} });
        else {
            const token = jwt.sign({email}, config.secret);
            Users.create({
                name: req.body.name,
                email: req.body.email,
                password: hashpass,
                confirmationCode: token,
                ph_number: req.body.ph_number || null,
                address: req.body.address || null,
                isActive: true
            }, (err, user) => {
                if (err) throw err;
                res.status(200).render('signup',{success:"Successful registered, check your email"});
            });
            nodemailer.sendConfirmationEmail(
                req.body.name,
                req.body.email,
                token
            );
        }
    });
});

router.get('/confirm/:confirmationCode', (req, res) => {
    Users.findOne({ confirmationCode: req.params.confirmationCode }, (err, data) => {
        if (err) return res.status(500).send('error while confirming');

        if (!data) return res.send({ auth: false, code: "error in verifying" });
        data.status = "Active";
        data.save((err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else { return res.render('login',{ msg: 'your email is confirmed' }); }
        });
    });
});


router.post('/login', (req, res) => {
    Users.findOne({ email: req.body.email }, (err, data) => {
        if (err) return res.status(500).send('error while login');

        if (!data) return res.render('login',{error:{token: "no user found"} });

        else {
            const validPass = bcrypt.compareSync(req.body.password, data.password);

            if (!validPass) {
                return res.render('login',{error:{ptoken: 'invalid password' }});
            }
            else if (data.status != "Active") {
                return res.status(401).render('login',{
                    message: "Pending Account. Please Verify Your Email!",
                });
            }
            else {
                if (data.role != "admin"){
                    return res.render('userdash');
                }else{
                    return res.redirect('adminpage');
                }
            }

            // var token = jwt.sign({id:data._id},config.secret,{expiresIn:3600});
            // res.send({auth:true,token:token});
        }
    });
});

router.post('/forgot', (req,res)=>{
    Users.findOne({ email: req.body.email }, (err, data) => {
        if (!data) return res.status(400).render('forgot',{exist:"No email found"});
        else{
            var rtoken = jwt.sign({id:data._id},config.secret,{expiresIn:3600});
            var name = data.name;
            data.resetCode = rtoken;
            data.save((err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }else{
                res.render('forgot',{sent:"check your email for reset link"});
            }
        });
            nodemailer.sendResetEmail(
                name,
                req.body.email,
                rtoken
            );
        }
    });
});

router.get('/reset/:resetCode', (req,res)=>{
    Users.findOne({resetCode:req.params.resetCode}, (err,data)=>{
        if (err) throw err;
        else{
            res.render('reset',{
                list:data
            });
        }
    }).lean();
});

router.post('/reset',(req,res)=>{
    Users.findOne({_id:req.body._id},(err,user) => {
        if(!err){
            newPass = req.body.npass;
            conPass = req.body.cpass;
            if (newPass != conPass){
                return res.send("password missmatch");
            }else{
                var hashpass = bcrypt.hashSync(conPass, 8);
                user.password = hashpass;
                user.save((err) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }
                    else { 
                        return res.render('login',{ msg: 'your password is updated' }); }
                });
            }
        }
    });
});

router.get('/adminpage', (req, res) => {
    Users.find({}, (err, user) => {
        if (err) throw err;
        res.render('admindash',{
            list:user
        });
    }).lean();
});

router.get('/update/:id',(req,res) => {
    Users.findById(req.params.id,(err,user) => {
        if(!err){
            res.render("addOrEdit",{
                list: user
            });
        }
    });
});

router.post('/update',(req,res)=>{
    Users.findOneAndUpdate({_id:req.body._id},(err,data)=>{
        if(!data)return res.send("error in updating");
        data.name = req.body.name;
        data.ph_number = req.body.ph_number;
        data.address = req.body.address;
        data.save((err) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }
            else { return res.send({ msg: 'your password updated' }); }
        });
    });
});

router.get('/delete/:id',(req,res) => {
    Users.findByIdAndRemove(req.params.id,(err,doc) => {
        if(!err){
            res.redirect('/api/adminpage');
        }
        else{
            console.log("An error occured during the Delete Process" + err);
        }
    });
});



module.exports = router;