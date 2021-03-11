const mongoose = require('mongoose');
 
var UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    ph_number:Number,
    address:String,
    resetCode:String,
    role:{
      type: String, 
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive:Boolean,
    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
      },
      confirmationCode: { type: String, unique: true }
});

mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Users');
