const { createClient } = require('redis');

let redisClient;

async function initRedis() {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error (handled):', err.message);
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis ready');
  });

  await redisClient.connect();
  console.log('🔌 Redis connected');

  return redisClient;
}

function getRedis() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redisClient;
}

module.exports = { initRedis, getRedis };
