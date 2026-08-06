import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis.js";

export const userQueue = new Queue("userQueue", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3, // Retry failed jobs 3 times

    backoff: {
      type: "exponential",
      delay: 5000, // 5s → 10s → 20s
    },

    removeOnComplete: 100, // Keep last 100 successful jobs
    removeOnFail: 50, // Keep last 50 failed jobs
  },
});