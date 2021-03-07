const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../model/userSchema');
const config = require('../config/config');
const nodemailer = require("../config/nodemailer");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/signup', (req, res) => {
    hashpass=bcrypt.hashSync(req.body.password,8);   
    Users.findOne({ email: req.body.email }, (err, email) => {
        if (email) return res.status(400).send("User Already Exists");
        else {
            const token = jwt.sign({email: req.body.email}, config.secret);
            Users.create({
                name: req.body.name,
                email: req.body.email,
                password: hashpass,
                confirmationCode: token,
                ph_number: req.body.ph_number || null,
                address: req.body.address || null,
                role: req.body.role || 'user',
                isActive: true
            }, (err, user) => {
                if (err) throw err;
                res.status(200).send('Successfully Registered');
            });
            nodemailer.sendConfirmationEmail(
                req.body.name,
                req.body.email,
                token
            );
        }
    });
});

router.get('/confirm/:confirmationCode',(req,res)=>{
    Users.findOne({confirmationCode: req.params.confirmationCode},(err,data)=>{
        if(err) return res.status(500).send('error while confirming');

        if(!data) return res.send({auth:false,code:"error in verifying"});
        data.status = "Active";
        data.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            else {return res.send({msg:'your email is confirmed'});}
          });
    });
});

router.post('/login',(req,res)=>{
    Users.findOne({email:req.body.email},(err,data)=>{
        if(err) return res.status(500).send('error while login');

        if(!data) return res.send({auth:false,token:"no user found"});
        
        else{
            const validPass = bcrypt.compareSync(req.body.password, data.password);
            
            if(!validPass){
                return res.send({auth:false,token:'invalid password'});
            } 
            else if (data.status != "Active") {
                return res.status(401).send({
                  message: "Pending Account. Please Verify Your Email!",
                });
            }
            else{
                res.render('home')
            }

            // var token = jwt.sign({id:data._id},config.secret,{expiresIn:3600});
            // res.send({auth:true,token:token});
        }
    });
});

router.get('/all', (req, res) => {
    Users.find({}, (err, user) => {
        if (err) throw err;
        res.status(200).send(user);
    });
});

module.exports = router;