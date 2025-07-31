import { Global, Module } from "@nestjs/common";

import { redisProviders } from "./redis.providers.js";
import { RedisService } from "./redis.service.js";

@Global()
@Module({
  exports: [RedisService],
  providers: [...redisProviders, RedisService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RedisModule {}
