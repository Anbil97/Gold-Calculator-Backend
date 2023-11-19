const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/gold-rate-calculator', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define the gold rate data model
const goldRateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  goldRate: { type: Number, required: true }
});

const GoldRate = mongoose.model('GoldRate', goldRateSchema);

// Create an Express app
const app = express();

// Fetch gold rate data from an external API
const fetchGoldRateData = async () => {
  const response = await axios.get('https://api.goldprice.org/v1/prices/gold/USD/latest');
  const goldRateData = response.data.data.price;
  const date = new Date();
  const time = date.toISOString().slice(11, 16);
  const newGoldRate = new GoldRate({ date, time, goldRate: goldRateData });
  await newGoldRate.save();
};

// Fetch gold rate data every hour
setInterval(fetchGoldRateData, 3600000);

// API endpoint to get the latest gold rate
app.get('/latest-gold-rate', async (req, res) => {
  const latestGoldRate = await GoldRate.findOne({}, {}, { sort: { _id: -1 }, limit: 1 }).exec();
  res.json({ latestGoldRate });
});

// API endpoint to get gold rate history for a specific date range
app.get('/gold-rate-history', async (req, res) => {
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);
  const goldRateHistory = await GoldRate.find({ date: { $gte: startDate, $lte: endDate } }).exec();
  res.json({ goldRateHistory });
});

// Start the server
app.listen(3000, () => console.log('Server started on port 3000'));
