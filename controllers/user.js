const User = require("../models/users.js");

//Core functionality for signup
module.exports.signup = async (req,res)=>{
    try{
        let {username,email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    req.session.redirectURL = "/stays";
    req.login(registeredUser , (err)=>{
        if(err) return next(err);
         req.flash("success",`Welcome ${username}`);
    res.redirect(req.session.redirectURL);
    });
    }
    
    catch(e){
        req.flash("error", e,message);
        res.redirect("/signup");
    }
};

//Core functionality of Login
module.exports.login = async (req,res)=>{
    let {username,password} = req.body;
    req.flash("success", `Welcome back, ${username}`);
    let url = res.locals.redirectURL || "/stays";
    res.redirect(url);
};

//Functionality of Logout
module.exports.logout = async (req,res,err)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "Logged Out!");
        res.redirect("/stays");
    });
};

// Show all the bookings of a logged-in user
module.exports.showBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: "bookings",
        options: { sort: { bookedOn: -1 } },
        populate: { path: "stay" }
      });

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/stays");
    }
    const bookings = user.bookings;
    res.render("users/booking.ejs", { bookings });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
