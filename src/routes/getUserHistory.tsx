const express = require('express');
const getUserHistoryRoute = express.Router();
const Reward = require('../models/reward.tsx');
const StockHistory = require('../models/stockHistory.tsx');

getUserHistoryRoute.get('/history/:userId', async (req, res) => {
	const userId = req.params.userId;
	const portfolioData = await Reward.find({
		userId: userId,
	}).populate('userId', ['firstName', 'lastName', 'email']);

	//bundled quantities for  duplicate data
	const enrichedPortfolio = [];
	portfolioData.map((reward) => {
		let currStock = enrichedPortfolio.find(
			(item) => item.stockSymbol === reward.symbol,
		);

		if (currStock) {
			currStock.quantity = Number(currStock.quantity) + Number(reward.quantity);
		} else
			enrichedPortfolio.push({
				name: reward.userId.firstName + ' ' + reward.userId.lastName,
				email: reward.userId.email,
				stockSymbol: reward.symbol,
				quantity: reward.quantity,
				boughtPrice: reward.unitPrice,
			});
	});

	await Promise.all(
		enrichedPortfolio.map(async (stock) => {
			const stockHistory = await StockHistory.findOne({
				symbol: stock.stockSymbol,
			});
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);

			const dateHistory = [];
			// for yesterday price history
			let lastIndex = stockHistory.priceHistory.findLastIndex(
				(stock) =>
					stock.date.substring(0, 10) === yesterday.toString().substring(0, 10),
			);
			if (lastIndex != -1)
				dateHistory.push(stockHistory.priceHistory[lastIndex]);

			// for today price history
			lastIndex = stockHistory.priceHistory.findLastIndex(
				(stock) =>
					stock.date.substring(0, 10) ===
					new Date().toString().substring(0, 10),
			);
			dateHistory.push(stockHistory.priceHistory[lastIndex]);
			console.log(dateHistory);

			stock.stockHistory = dateHistory;
		}),
	);

	res.json({
		message:
			'Stock history for ' +
			portfolioData[0].userId.firstName +
			' upto yesterday',
		historyData: enrichedPortfolio,
	});
});

module.exports = getUserHistoryRoute;
