// router to give reward to user 

const mongoose = require("mongoose")

const rewardSchema = new mongoose.Schema({
    userId: {      // stores user to whome stock is given
        type: String,
        ref: "User",
        required: true
    },
    symbol: {       // stores symbol of stock given
        type: String,
        required: true
    },
    quantity: {
        type: String || Number,      // quantity of stock awarded, fraction allowed
        default: 1                   // if quantity is not specified, by default taking 1 as quantity
    },
    unitPrice: {
        type: String || Number,      // price when stock was awarded 
    },
    currentPrice: {
        type: String || Number       // will be updated every hour, using a service for fetch stocks live prices
    },
    rewardNote: {
        type: String
    }
}, { timestamps: true })

const Reward = mongoose.model('Reward', rewardSchema)
module.exports = Reward