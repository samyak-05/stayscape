const mongoose = require('mongoose');
const initData = require('./data.js');
const listings = require('../models/stays.js');
const db_URL = "mongodb://127.0.0.1:27017/stayscape";

main()
    .then((res) => {
        console.log("Database is connected!");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(db_URL);
}

const init = async () => {
    await listings.deleteMany({});
    const dataWithOwner = initData.data.map((obj) => ({
        ...obj,
        owner: "68e7fb1c13b37114622d7b44",
    }));

    await listings.insertMany(dataWithOwner);
    console.log("DB Initialised!");
}

init();