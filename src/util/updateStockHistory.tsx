const StockHistory = require("../models/stockHistory.tsx")
const getRandomStockPrice = require("./hypotheticStockPriceService.tsx")



const updateStockHistory = async () => {
    const stockList = await StockHistory.find({})
    stockList.forEach(async (stock) => {
        await StockHistory.updateOne(
            { symbol: stock.symbol },
            { $push: { priceHistory: { date: new Date(), price: getRandomStockPrice(stock.symbol) } } }
        )
    })
}

module.exports = updateStockHistory