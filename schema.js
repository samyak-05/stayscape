const joi = require('joi');

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().required().min(0),
    location: joi.string().required(),
    country: joi.string().required(),
    category: joi
      .string()
      .valid(
        "Trending",
        "Rooms",
        "Camping",
        "Snowy",
        "Royal Stays",
        "Hostels",
        "Mountains",
        "Beaches"
      )
      .required(),
    image: joi
      .object({
        url: joi
          .string()
          .uri()
          .empty("")
          .default("https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b"),
      })
      .default(),
  }).required(),
});



module.exports.reviewSchema = joi.object({
    review : joi.object({
        rating : joi.number().required().min(1).max(5),
        comment : joi.string().required()
    }).required(),
});