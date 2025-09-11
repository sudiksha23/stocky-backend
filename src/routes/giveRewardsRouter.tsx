const express = require('express')
const giveRewardsRouter = express.Router()
const Reward = require("../models/reward.tsx")
const DoubleEntryLedger = require("../models/doubleEntryLedger.tsx")
const StockHistory = require("../models/stockHistory.tsx")

giveRewardsRouter.post('/reward', async (req, res) => {
   try { 
    const reward = new Reward(req.body)
    const response = await reward.save()

    const totalCashOutflow = response.unitPrice * response.quantity
    const ledgerEntry = new DoubleEntryLedger({
        rewardId: response._id.toString(),
        stockSymbol: response.symbol,
        quantity: response.quantity,
        totalCashOutflow: totalCashOutflow,
        additionFees:{
            brokerage: (0.02)*totalCashOutflow,
            stt: (0.07)*totalCashOutflow,
            gst: (0.07)*totalCashOutflow,
            others: (0.01)*totalCashOutflow,
        }
    })
    await ledgerEntry.save()
   
    const findStockInHistory =  await StockHistory.find({ symbol: response.symbol })   
    console.log(findStockInHistory)
    if(findStockInHistory.length<=0) {
        const stockHistory = new StockHistory({
            symbol: response.symbol,
            priceHistory: []
        })
        await stockHistory.save()
    }

    res.send("Reward given successfully")
    } catch (err) {
        res.status(400).send(err.message)
    }
})

module.exports = giveRewardsRouter
