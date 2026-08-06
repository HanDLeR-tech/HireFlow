import { Worker } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { upsertStreamUser } from "../lib/stream.js";

export const userWorker = new Worker(
  "userQueue",
  async (job) => {
    switch (job.name) {
      case "sync-user": {
        const { userId, name, image } = job.data;

        console.log(`🔄 Syncing user ${userId} to Stream...`);

        await upsertStreamUser({
          id: userId,
          name,
          image,
        });

        console.log(`✅ User ${userId} synced successfully`);

        break;
      }

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
  }
);

userWorker.on("ready", () => {
  console.log("👷 User Worker is ready");
});

userWorker.on("completed", (job) => {
  console.log(`✅ Job "${job.name}" completed`);
});

userWorker.on("failed", (job, err) => {
  console.error(`❌ Job "${job?.name}" failed:`, err.message);
});

userWorker.on("error", (err) => {
  console.error("❌ Worker Error:", err);
});