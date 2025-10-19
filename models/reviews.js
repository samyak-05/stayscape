const { date } = require('joi');
const mongoose = require('mongoose');
const db_URL = "mongodb://127.0.0.1:27017/stayscape";
const Schema = mongoose.Schema;

async function main(){
    await mongoose.connect(db_URL);
}

const reviewSchema = new Schema({
    comment : String,
    rating : {
        type : Number,
        min : 1,
        max : 5
    },
    createdAt :{
        type: Date,
        default: Date.now()
    },
    author:{
        type: Schema.Types.ObjectId,
        ref : "User"
    }
});

module.exports = mongoose.model("Review", reviewSchema);