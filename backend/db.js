const mongoose = require("mongoose");

const mongoURI = "mongodb+srv://Kshitij:naveen76@i-notebook.ebbzd.mongodb.net/iNotebook"

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Successfully connected to mongoDB.");
    })
}

module.exports = connectToMongo;
