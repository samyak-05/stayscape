const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middlewares.js");
const {isOwner} = require("../middlewares.js");
const {validateListing} = require("../middlewares.js");
const stayController = require("../controllers/stay.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//Index & Create Routes
router
.route("/")
.get(wrapAsync (stayController.index))
.post( isLoggedIn, upload.single('image'), validateListing , wrapAsync(stayController.create));


//NEW Route
router.get("/new", isLoggedIn, stayController.new);

//Search Route
router.get("/search", stayController.search);

//Show, Update, Delete Routes
router
.route("/:id")
.get(wrapAsync (stayController.show))
.put(isLoggedIn,isOwner, upload.single('image'),validateListing, wrapAsync(stayController.update))
.delete(isLoggedIn, isOwner, wrapAsync(stayController.delete));

//EDIT Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync (stayController.edit));

//Booking Route
router.route("/:id/book").post(isLoggedIn, wrapAsync (stayController.bookStay));

module.exports = router;