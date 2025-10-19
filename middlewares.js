const Listing = require("./models/stays");
const { listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/reviews.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectURL = req.originalUrl;
        req.flash("error", "You must be logged in to access this functionality!");
        return res.redirect("/login");
    }

    next();
};

module.exports.saveRedirectURL = (req,res,next)=>{
    if(req.session.redirectURL){
        res.locals.redirectURL = req.session.redirectURL;
    }

    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let stay = await Listing.findById(id);
    if(!stay.owner._id.equals(res.locals.currUser._id) && res.locals.currUser){
        req.flash("error","You dont have permission to perform this operation!");
        return res.redirect(`/stays/${id}`);
    }
    next();
};

//Validate Listing Middleware
module.exports.validateListing = (req,res,next) =>{
    const {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }   
    else{
        next();
    }       
};

//Validate Review Middleware
module.exports.validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }   
    else{
        next();
    }       
};

module.exports.isAuthor = async (req,res,next)=>{
    let {id,ReviewId} = req.params;
    let review = await Review.findById(ReviewId);
    if(!review.author._id.equals(res.locals.currUser._id) && res.locals.currUser){
        req.flash("error","You dont have permission to perform this operation!");
        return res.redirect(`/stays/${id}`);
    }
    next();
};

module.exports.noCache = (req, res, next)=>{
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '-1');
  next();
};
