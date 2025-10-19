const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectURL, isLoggedIn } = require("../middlewares.js");
const userController = require("../controllers/user.js");
const {noCache} = require('../middlewares.js');

//Signup Route
router
.route("/signup")
.get(noCache, (req,res) => {res.render("../views/users/signup.ejs")})
.post(wrapAsync (userController.signup));

//Login Route
router
.route("/login")
.get(noCache, (req,res) => {res.render("../views/users/login.ejs")})
.post( saveRedirectURL, 
    passport.authenticate("local",{failureRedirect : "/login", failureFlash : true}),
    wrapAsync(userController.login)
);

//Logout Route
router.get("/logout", noCache, userController.logout);

//User Bookings Route
router.get("/bookings",isLoggedIn, noCache, wrapAsync (userController.showBookings));

module.exports = router;