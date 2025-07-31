import { Provider } from "@nestjs/common";
import { Redis } from "ioredis";

import { REDIS_PUBLISHER_CLIENT, REDIS_SUBSCRIBER_CLIENT } from "./redis.constants.js";

export type RedisClient = Redis;

export const redisProviders: Provider[] = [
  {
    provide: REDIS_SUBSCRIBER_CLIENT,
    useFactory: (): RedisClient => {
      // In production, use ConfigService for these values
      return new Redis({ host: "localhost", port: 6379 });
    },
  },
  {
    provide: REDIS_PUBLISHER_CLIENT,
    useFactory: (): RedisClient => {
      return new Redis({ host: "localhost", port: 6379 });
    },
  },
];
