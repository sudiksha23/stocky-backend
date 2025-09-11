const mongoose = require("mongoose")

const stockHistorySchema = mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    priceHistory: {
        type: [{
            date: String || Date,
            price: String || Number
        }],
        default:[]
    }
})

stockHistorySchema.index({ symbol:1 })

const StockHistory = mongoose.model('StockHistory', stockHistorySchema)
module.exports = StockHistory