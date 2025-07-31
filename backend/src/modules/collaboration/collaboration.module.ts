import { RedisModule } from "#common/redis/redis.module.js";
import { RoomsModule } from "#modules/rooms/rooms.module.js";
import { Module } from "@nestjs/common";

import { CollaborationGateway } from "./collaboration.gateway.js";

@Module({
  imports: [RoomsModule, RedisModule],

  providers: [CollaborationGateway],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CollaborationModule {}
