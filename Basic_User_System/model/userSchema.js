const mongoose = require('mongoose');
 
var UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    ph_number:Number,
    address:String,
    pro_image:String,
    co_image:String,
    isActive:Boolean
});

mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Users');