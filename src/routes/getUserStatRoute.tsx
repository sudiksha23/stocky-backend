const express = require('express');
const getUserStatRoute = express.Router();
const Reward = require('../models/reward.tsx');
const getRandomStockPrice = require('../util/hypotheticStockPriceService.tsx');

getUserStatRoute.get('/stats/:userId', async (req, res) => {
	const userId = req.params.userId,
		startDay = new Date().setUTCHours(0, 0, 0, 0),
		endDay = new Date().setUTCHours(23, 59, 59, 999);

	const todaysRewards = await Reward.find({
		$and: [{ userId: userId }, { createdAt: { $gte: startDay, $lte: endDay } }],
	});

	const usersRewards = await Reward.find({ userId: userId });

	let portfolioValue = usersRewards.reduce((acc, curr) => {
		return acc + curr.quantity * getRandomStockPrice(curr.symbol);
	}, 0);

	const todayStocksGrouped = todaysRewards.reduce((acc, curr) => {
		acc[curr.symbol] = (acc[curr.symbol] || 0) + curr.quantity * curr.unitPrice;
		return acc;
	}, {});

    res.json({
		message: 'User stats fetched successfully.',
		data: {
			stocksRewardedToday: todayStocksGrouped,
			CurrentINRPortfolioValue: portfolioValue,
		},
	});
});

module.exports = getUserStatRoute;
