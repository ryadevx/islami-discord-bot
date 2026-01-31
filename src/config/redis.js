const { createClient } = require('redis');

let client;

async function initRedis() {
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: retries => {
        console.log(`🔁 Redis reconnect attempt #${retries}`);
        return Math.min(retries * 100, 3000);
      }
    }
  });

  client.on('connect', () => {
    console.log('🔌 Redis socket connected');
  });

  client.on('ready', () => {
    console.log('✅ Redis ready');
  });

  client.on('error', (err) => {
    console.error('❌ Redis error (handled):', err.message);
  });

  await client.connect();
  return client;
}

module.exports = { initRedis };
