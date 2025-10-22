if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 5000;
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require("express-ejs-layouts");
const db_URL = process.env.ATLASDB_URL;
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const stayRoutes = require("./routes/stay.js");
const reviewRoutes = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const localStrategy = require("passport-local");
const User = require("./models/users.js");
const passport = require('passport');
const userRoutes = require("./routes/user.js");

app.engine("ejs",ejsMate);
app.use(express.urlencoded({extended : true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); 
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate.ejs");

const store = MongoStore.create({
    mongoUrl: db_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

main()
.then((res)=>{
    console.log("Database is connected!");
})
.catch((err) =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(db_URL);   
}

app.get("/terms", (req, res) => {
    res.render("stayscape/terms");
});

app.get("/privacy", (req, res) => {
    res.render("stayscape/privacy");
});

app.get("/contact", (req, res) => {
    res.render("stayscape/contact");
});

app.use("/stays", stayRoutes);
app.use("/stays/:id/reviews", reviewRoutes);
app.use("/",userRoutes);

//Catch-All Route
app.use((req,res,next) =>{
    next(new ExpressError(404,"Page Not Found"));
});

//Error Handler
app.use((err, req, res, next) =>{
    let {status=500,message="Something wnet Wrong!"} = err;
    res.status(status).render("error.ejs",{err});
});

app.listen(port, ()=>{
    console.log(`Webapp is live at port : ${port}`);
});