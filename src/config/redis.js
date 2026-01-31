const { createClient } = require("redis");

let redisClient = null;

async function initRedis() {
  if (!process.env.REDIS_URL) {
    console.warn("⚠️ REDIS_URL not set → Redis disabled");
    return null;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        console.warn(`🔁 Redis reconnect attempt #${retries}`);
        return Math.min(retries * 200, 2000);
      },
      keepAlive: 5000,
    },
  });

  // 🔥 CRITICAL: never crash on Redis errors
  redisClient.on("error", (err) => {
    console.error("❌ Redis error (handled):", err.message);
  });

  redisClient.on("connect", () => {
    console.log("🔌 Redis socket connected");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis ready");
  });

  redisClient.on("end", () => {
    console.warn("⚠️ Redis connection closed");
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis initial connection failed:", err.message);
    redisClient = null;
  }

  return redisClient;
}

function getRedis() {
  return redisClient;
}

module.exports = {
  initRedis,
  getRedis,
};
