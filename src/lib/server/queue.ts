import IORedis from "ioredis";
import { env } from "$env/dynamic/private";

import { Queue } from "bullmq";

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  password: env.REDIS_PASSWD,
  username: "default",
});

const mediaQueue = new Queue("media-processing", { connection });

export { mediaQueue, connection };
