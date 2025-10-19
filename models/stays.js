//MODEL for all the listings available on the site
//---------------------------------------------------------------------------------------------------------------

const mongoose = require('mongoose');
const db_URL = "mongodb://127.0.0.1:27017/stayscape";
const Schema = mongoose.Schema;
const Review = require('./reviews.js');
const User = require("./users.js");

async function main(){
    await mongoose.connect(db_URL);
}

const listings = new Schema({
  title : { type : String, required : true },
  description : String,
  image : {
    url : String,
    filename : String
  },
  price : Number,
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Camping", "Snowy", "Royal Stays", "Hostels", "Mountains", "Beaches"],
    required: true
  },
  location : String,
  country : String,
  reviews : [{ type : Schema.Types.ObjectId, ref : "Review" }],
  owner : {type : Schema.Types.ObjectId, ref:"User",},
});

listings.index({ location: 'text', country: 'text' });

listings.post("findOneAndDelete", async(stay)=>{
    if(stay){
        await Review.deleteMany({_id : {$in : stay.reviews}});
    }
});

const Listing = mongoose.model("Listings", listings); 
module.exports = Listing;