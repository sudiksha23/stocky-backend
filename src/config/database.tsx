const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://sudikshasa23:WaqzQfj3Ro6FMrmx@namastenodecluster0.sefbvla.mongodb.net/stockyDatabase")
}

module.exports = connectDB