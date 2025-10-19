const listings = require("../models/stays.js");
const Review = require("../models/reviews.js");

//Adding a review
module.exports.addReview = async (req,res,next)=>{
    let {id} = req.params;
    let stay = await listings.findById(id);
    let newReview = new Review(req.body.review);
    stay.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await stay.save();
    req.flash("success", "Review Added!");
    res.redirect(`/stays/${id}`);
};

//Deleting a review
module.exports.deleteReview = async (req,res,next)=>{
    let {id, ReviewId} = req.params;
    await listings.findByIdAndUpdate(id, {$pull: {reviews: ReviewId}});
    await Review.findByIdAndDelete(ReviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/stays/${id}`);
};