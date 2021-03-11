const { response } = require('express');
const nodemailer = require('nodemailer');
const confi = require('../config/config');

const user = confi.user;
const pass = confi.password;

let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: user, 
      pass: pass, 
    },
  });

  module.exports.sendConfirmationEmail=(name, email, ConfirmationCode)=>{
      transport.sendMail({
          from:user,
          to:email,
          subject:"please confirm your email",
          html:`<h1>Email Confirmation</h1>
          <h2>hello ${name}</h2>
          <p>Please confirm your email by clicking on the following link</p>
          <a href=http://localhost:5678/api/confirm/${ConfirmationCode}> Click here</a>
          `
      }).catch(err => console.log(err));
  };

  module.exports.sendResetEmail=(name, email, ResetCode)=>{
    transport.sendMail({
        from:user,
        to:email,
        subject:"reset your account",
        html:`<h1>Account reset</h1>
        <h2>hello ${name}</h2>
        <p>Please update your password by clicking on the following link</p>
        <a href=http://localhost:5678/api/reset/${ResetCode}> Click here</a>
        `
    }).catch(err => console.log(err));
};
