import Redis from "ioredis";
import { ENV } from "./env.js";

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});