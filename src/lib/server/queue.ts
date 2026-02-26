import IORedis from "ioredis";
import { REDIS_URL, REDIS_PASSWD } from "$env/static/private";

import { Queue } from "bullmq";

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  password: REDIS_PASSWD,
  username: "default",
});

const mediaQueue = new Queue("media-processing", { connection });

export { mediaQueue, connection };
