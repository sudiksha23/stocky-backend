
const approxPriceOfStocks = {
    "ASIANPAINT": 2500,
    "PRESTIGE": 900,
    "TCS": 3100,
    "CDSL": 1700,
    "LALPATHLAB": 3200
}

const getRandomStockPrice = (stockName) => {
    const lowerBound = Number(approxPriceOfStocks[stockName]), upperBound = Number(approxPriceOfStocks[stockName])+200
    return Math.random() * ( upperBound-lowerBound ) + lowerBound
}
module.exports = getRandomStockPrice