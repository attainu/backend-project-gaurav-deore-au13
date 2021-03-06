const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../model/userSchema');
const config = require('../config/config');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/signup', (req, res) => {
    hashpass=bcrypt.hashSync(req.body.password,8);
    
    Users.findOne({ email: req.body.email }, (err, email) => {
        if (email) return res.status(400).send("User Already Exists");
        else {
            Users.create({
                name: req.body.name,
                email: req.body.email,
                password: hashpass,
                ph_number: req.body.ph_number || null,
                address: req.body.address || null,
                role: req.body.role || 'user',
                isActive: true
            }, (err, user) => {
                if (err) throw err;
                res.status(200).send('Successfully Registered');
            });
        }
    });
});

router.post('/login',(req,res)=>{
    Users.findOne({email:req.body.email},(err,data)=>{
        if(err) return res.status(500).send('error while login');

        if(!data) return res.send({auth:false,token:"no user found"});
        else{
            const validPass = bcrypt.compareSync(req.body.password, data.password);
            if(!validPass) return res.send({auth:false,token:'invalid password'});

            var token = jwt.sign({id:data._id},config.secret,{expiresIn:3600});
            res.send({auth:true,token:token});
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