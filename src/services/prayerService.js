const axios = require('axios');
const config = require('../config/config');

let cachedTimes = null;
let lastFetchDate = null;

async function getPrayerTimes() {
  const today = new Date().toDateString();

  // ✅ Use cached times if already fetched today
  if (cachedTimes && lastFetchDate === today) {
    return cachedTimes;
  }

  try {
    const response = await axios.get(
      'https://api.aladhan.com/v1/timingsByCity',
      {
        params: {
          city: config.CITY,
          country: config.COUNTRY,
          method: config.METHOD,
        },
      }
    );

    cachedTimes = response.data.data.timings;
    lastFetchDate = today;

    console.log('🕌 Prayer times fetched successfully');
    return cachedTimes;
  } catch (err) {
    console.error('❌ Failed to fetch prayer times:', err.message);

    // ✅ Fallback to cached data
    if (cachedTimes) {
      console.warn('⚠️ Using cached prayer times');
      return cachedTimes;
    }

    return null;
  }
}

module.exports = { getPrayerTimes };
