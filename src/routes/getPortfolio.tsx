const express = require("express")
const getPortfolioRouter = express.Router()
const Reward = require("../models/reward.tsx")
const getRandomStockPrice = require("../util/hypotheticStockPriceService.tsx")

getPortfolioRouter.get("/portfolio/:userId", async(req, res) => {
    const userId = req.params.userId
    const portfolioData = await Reward.find({
        userId: userId
    }).populate('userId', ['firstName', 'lastName', 'email'] )

    const enrichedPortfolio = []
    portfolioData.map((reward) => {
        let currStock = enrichedPortfolio.find((item) => item.stockSymbol===reward.symbol )
        console.log(currStock)
        let currrewardPrice = getRandomStockPrice(reward.symbol)
        if(currStock){
            currStock.quantity = Number(currStock.quantity) + Number(reward.quantity)
            currStock.currentValue = Number(currStock.currentValue) + (Number(reward.quantity) * Number(reward.unitPrice))
            console.log(currStock)
        }
        else enrichedPortfolio.push({
            name: reward.userId.firstName + ' ' +reward.userId.lastName ,
            email: reward.userId.email,
            stockSymbol: reward.symbol,
            quantity: reward.quantity,
            boughtPrice: reward.unitPrice,
            currentPrice: currrewardPrice,
            currentValue: currrewardPrice * reward.quantity
        })
    })
    
    res.json({
        message: 'Hello '+portfolioData[0].userId.firstName+', Here is you current portfolio', 
        stocks: enrichedPortfolio
    })

})

module.exports = getPortfolioRouter