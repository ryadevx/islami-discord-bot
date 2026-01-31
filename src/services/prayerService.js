const axios = require('axios');
const config = require('../config/config');
const redis = require('../config/redis');

const CACHE_KEY = 'prayer_times_algiers';
const CACHE_TTL = 60 * 60 * 24; // 24 hours

async function getPrayerTimes() {
  const cached = await redis.get(CACHE_KEY);

  if (cached) {
    console.log('🧠 Using Redis cached prayer times');
    return JSON.parse(cached);
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

    const timings = response.data.data.timings;

    // 3️⃣ Store in Redis
    await redis.set(
      CACHE_KEY,
      JSON.stringify(timings),
      { EX: CACHE_TTL }
    );

    console.log('🕌 Prayer times fetched & cached in Redis');
    return timings;
  } catch (err) {
    console.error('❌ Failed to fetch prayer times:', err.message);
    return null;
  }
}

module.exports = { getPrayerTimes };
