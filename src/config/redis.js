const { createClient } = require('redis');

let redis;

async function initRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('❌ REDIS_URL is missing');
  }

  redis = createClient({
    url,
    socket: {
      tls: true,
      rejectUnauthorized: false, // REQUIRED for Upstash
      reconnectStrategy: (retries) => {
        console.log(`🔁 Redis reconnect attempt #${retries}`);
        return Math.min(retries * 300, 3000);
      },
    },
  });

  redis.on('connect', () => console.log('🔌 Redis connected'));
  redis.on('ready', () => console.log('✅ Redis ready'));
  redis.on('end', () => console.log('⚠️ Redis connection closed'));
  redis.on('error', (err) =>
    console.error('❌ Redis error (handled):', err.message)
  );

  await redis.connect();
  return redis;
}

module.exports = { initRedis };
