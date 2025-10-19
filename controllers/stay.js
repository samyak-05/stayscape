const listings = require("../models/stays.js");
const Booking = require("../models/bookings.js");
const sendMail = require("../utils/mailer.js");

//Index Page
module.exports.index = async (req,res,next) =>{
    const { category } = req.query;
    const filter = {};
    if (category) {
        filter.category = category;
    }
    const allListings = await listings.find(filter);
    res.render("stays/index.ejs", { allListings });
};

//Adding new Stay
module.exports.new =  (req,res)=>{
    res.render("stays/new.ejs");
};

//Core functionality of adding a stay
module.exports.create = async (req, res, next) => {
    // Destructure listing from request body
    const { listing } = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    // Create and save the new listing
    const newListing = new listings(listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    // Flash success and redirect
    req.flash("success", "New Stay Added!");
    res.redirect("/stays");
};

//Getting a particular stay from Database
module.exports.show = async (req,res,next) =>{
    let {id} = req.params;
    const listing = await listings.findById(id).populate({path :"reviews", populate:{path : "author",}}).populate("owner");
    //const reviews = await Review.find({_id: {$in: listing.reviews}});
    if(!listing){
        req.flash("error","This stay does not exsist!");
        return res.redirect("/stays");
    }
    res.render("stays/show.ejs",{listing});
};

//Searching stays
module.exports.search = async (req,res)=>{
    let {q} = req.query;
    if(!q){
        res.redirect("/stays");
    }
    const exactQuery = `"${q}"`;
    const searchResults = await listings.find({
        $text: { $search: exactQuery }
    });
    res.render("stays/search.ejs", { searchResults,q });
};

//Editing a stay
module.exports.edit = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await listings.findById(id);
    if(!listing){
        req.flash("error","The stay you are tring to edit does not exsist!");
        return res.redirect("/stays");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload","/upload/h_100,w_250");
    res.render("stays/edit",{listing, originalImage});  
};

//Core functionality to edit a stay
module.exports.update = async (req,res,next)=>{
    let {id} = req.params;
    let stay = await listings.findById(id);
    let updatedStay = await listings.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedStay.image = {url,filename};
        await updatedStay.save();
    }
    
    req.flash("success", "Stay details updated!");
    res.redirect(`/stays/${id}`);
};

//Deleting a stay
module.exports.delete = async (req,res,next)=>{
    let {id} = req.params;
    await listings.findByIdAndDelete(id);
    req.flash("success", "Stay Removed!");
    res.redirect("/stays");   
};

//Booking a stay
module.exports.bookStay = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = req.user;
    
    let stay = await listings.findById(id).populate('owner'); 

    if (!stay) {
        req.flash("error", "The stay you are trying to book does not exist.");
        return res.redirect("/stays");
    }

    let { checkInDate, checkOutDate, guests } = req.body;

    const existingBooking = await Booking.findOne({
      stay: id,
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    if (existingBooking) {
      req.flash("error", "Sorry, these dates are already booked for this stay.");
      return res.redirect(`/stays/${id}`);
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      req.flash("error", "Check-out date must be after check-in date.");
      return res.redirect(`/stays/${id}`);
    }

    const timeDifference = checkOut - checkIn;
    const totalNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const totalCost = totalNights * stay.price * 1.18;
    const formattedCost = totalCost;

    const newBooking = new Booking({
      user: user._id,
      stay: stay._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: formattedCost,
      guests: guests,
    });

    const savedBooking = await newBooking.save();
    user.bookings.push(savedBooking._id);
    await user.save();

    try {
      const subject = `Your StayScape Booking is Confirmed: ${stay.title}`;
      const htmlBody = `
        <div>
          <h1>Booking Confirmed!</h1>
          <p>Hi ${user.username},</p>
          <p>Your booking for <strong>${stay.title}</strong> is confirmed.</p>
          <h3>Booking Details:</h3>
          <ul>
            <li>Check-in: ${checkInDate}</li>
            <li>Check-out: ${checkOutDate}</li>
            <li>Guests: ${guests}</li>
            <li>Total Nights: ${totalNights}</li>
            <li>Total Cost: ₹${formattedCost.toFixed(2)}</li>
          </ul>
        <p>
        You should pay the total amount of ₹${formattedCost.toFixed(2)} at the time of check-in.
          Thanks for booking with StayScape!
        </p>
        </div>
      `;

      await sendMail(user.email, subject, htmlBody);
      req.flash("success", "Stay Booked Successfully! A confirmation has been sent to your email(Check Spam).");

    } catch (emailError) {
      console.error("Booking successful, but confirmation email failed:", emailError);
      req.flash("success", "Stay Booked Successfully! Your booking is confirmed.");
    }

    try {
      const ownerSubject = `New Booking for your stay: ${stay.title}`;
      const ownerHtmlBody = `
        <div>
          <h1>You have a new booking!</h1>
          <p>Hi ${stay.owner.username},</p>
          <p>Your property, <strong>${stay.title}</strong>, has been booked by ${user.username}.</p>
          
          <h3>Booking Details:</h3>
          <ul>
            <li>Check-in: ${checkInDate}</li>
            <li>Check-out: ${checkOutDate}</li>
            <li>Guests: ${guests}</li>
            <li>Total Nights: ${totalNights}</li>
          </ul>
        </div>
      `;

      await sendMail(stay.owner.email, ownerSubject, ownerHtmlBody);

    } catch (ownerEmailError) {
      console.error("Failed to send booking notification to owner:", ownerEmailError);
    }

    res.redirect(`/stays/${id}`);

  } catch (err) {
    console.error("Error in bookStay route:", err);
    req.flash("error", "Something went wrong, could not book your stay.");
    return res.redirect(`/stays/${id}`);
  }
};