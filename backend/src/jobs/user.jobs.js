import { userQueue } from "../queues/user.queue.js";

export async function enqueueSyncUser(user) {
  await userQueue.add("sync-user", {
    userId: user._id.toString(),
    name: user.name,
    image: user.profileImage,
  });
}