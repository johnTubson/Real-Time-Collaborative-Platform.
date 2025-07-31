import { RedisModule } from "#common/redis/redis.module.js";
import { CustomConfigModule } from "#config/config.module.js";
import { ConfigService } from "#config/config.service.js";
import { getTypeOrmConfig } from "#database/typeorm.config.js";
import { AuthModule } from "#modules/auth/auth.module.js";
import { CollaborationModule } from "#modules/collaboration/collaboration.module.js";
import { RoomsModule } from "#modules/rooms/rooms.module.js";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CustomConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
    }),
    RedisModule,
    AuthModule,
    RoomsModule,
    CollaborationModule,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
