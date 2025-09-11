const mongoose = require("mongoose")

const doubleLedgerSchema = mongoose.Schema({
    rewardId:{
        type: String,
        ref: "reward",
        required: true
    },
    stockSymbol: {
        type: String,
        required: true
    },
    quantity: {
        type: String || Number,
        default: 1
    },
    totalCashOutflow: {
        type: String || Number
    },
    additionFees: {         // additional charges incurred while rewarding
        brokerage: {
            type: String || Number,
        },
        stt: {
            type: String || Number,
        },
        gst: {
            type: String || Number,
        },
        others: {
            type: String || Number,
        }
    }
}, {timestamps: true})

const DoubleEntryLedger = mongoose.model('DoubleEntryLedger', doubleLedgerSchema)
module.exports = DoubleEntryLedger