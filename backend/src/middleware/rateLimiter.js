import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisConnection } from "../lib/redis.js";

const loginLimiter = new RateLimiterRedis({
  storeClient: redisConnection,
  keyPrefix: "login",
  points: 5,
  duration: 15 * 60,
});

const registerLimiter = new RateLimiterRedis({
  storeClient: redisConnection,
  keyPrefix: "register",
  points: 3,
  duration: 60 * 60,
});

const refreshLimiter = new RateLimiterRedis({
  storeClient: redisConnection,
  keyPrefix: "refresh",
  points: 30,
  duration: 60,
});

const createRateLimiter = (limiter) => {
  return async (req, res, next) => {
    try {
      // Use the client's IP as the unique identifier
      await limiter.consume(req.ip);

      next();
    } catch (error) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: 842,
      });
    }
  };
};

export const loginRateLimiter = createRateLimiter(loginLimiter);

export const registerRateLimiter = createRateLimiter(registerLimiter);

export const refreshRateLimiter = createRateLimiter(refreshLimiter);
