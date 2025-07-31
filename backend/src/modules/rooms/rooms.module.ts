import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Room } from "./entities/room.entity.js";
import { RoomsController } from "./rooms.controller.js";
import { RoomsService } from "./rooms.service.js";

@Module({
  controllers: [RoomsController],
  exports: [RoomsService, TypeOrmModule.forFeature([Room])],
  imports: [TypeOrmModule.forFeature([Room])],
  providers: [RoomsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RoomsModule {}
