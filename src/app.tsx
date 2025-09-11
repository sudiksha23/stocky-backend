const express = require("express")
const app = express()
const cron = require("node-cron")
const connectDB = require('./config/database.tsx')
const userRouter = require('./routes/userRouter.tsx')
const giveRewardsRouter = require('./routes/giveRewardsRouter.tsx')
const getTodayStocksRouter = require('./routes/getTodayStocksRoute.tsx')
const getUserStatRoute = require('./routes/getUserStatRoute.tsx')
const getPortfolioRouter = require('./routes/getPortfolio.tsx')
const updateStockHistory = require('./util/updateStockHistory.tsx')
const getUserHistoryRoute = require("./routes/getUserHistory.tsx")

app.use(express.json())
app.use('/', userRouter)
app.use('/', giveRewardsRouter)
app.use('/', getTodayStocksRouter)
app.use('/', getUserStatRoute)
app.use('/', getPortfolioRouter)
app.use('/', getUserHistoryRoute)

connectDB()
    .then(() => {
        console.log("Database connection extablised")
        app.listen(7777, () => {
            console.log("Server listening to port 7777...")
        })
    })
    .catch((err) => {
        console.error("DB cannot be connected. ", err.message )
    })

cron.schedule("0 * * * *", updateStockHistory)