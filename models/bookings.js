const { date } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stay: {
        type: Schema.Types.ObjectId,
        ref: 'Listings',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    guests: {
        type: Number,
        required: true,
        min: 1
    },
    bookedOn:{
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Booking', bookingSchema);
