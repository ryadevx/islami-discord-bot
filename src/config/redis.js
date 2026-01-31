const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;

const redis = createClient({
  url: redisUrl,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

(async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

module.exports = redis;
