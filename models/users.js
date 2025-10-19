const { required } = require('joi');
const mongoose = require('mongoose');
const passport = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type : String,
        required : true,
        unique : true,
    },
    bookings:[{
        type:Schema.Types.ObjectId,
        ref:"Booking",
    }],
});

userSchema.plugin(passport);

module.exports = mongoose.model("User",userSchema);