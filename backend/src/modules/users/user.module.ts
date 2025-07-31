import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Otp } from "./entities/otp.entity.js";
import { User } from "./entities/user.entity.js";
import { UsersService } from "./services/user.service.js";

@Module({
  exports: [UsersService, TypeOrmModule.forFeature([User, Otp])],
  imports: [TypeOrmModule.forFeature([User, Otp])],
  providers: [UsersService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
