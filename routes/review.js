const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middlewares.js");
const reviewController = require("../controllers/review.js");

//Add Review Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.addReview));

//Delete Review Route
router.delete("/:ReviewId", isLoggedIn, isAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;