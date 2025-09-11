const express = require('express');
const getTodayStocksRouter = express.Router();
const Reward = require('../models/reward.tsx');

getTodayStocksRouter.get('/getStocksForToday/:userId', async (req, res) => {
	const userId = req.params.userId,
		startDay = new Date().setUTCHours(0, 0, 0, 0),
		endDay = new Date().setUTCHours(23, 59, 59, 999);
	const todayData = await Reward.find({
		$and: [{ userId: userId }, { createdAt: { $gte: startDay, $lte: endDay } }],
	});
	res.json({
		message: 'List of all your stocks rewarded for today:',
		data: todayData,
	});
});

module.exports = getTodayStocksRouter;
