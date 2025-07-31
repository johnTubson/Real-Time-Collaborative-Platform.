import { JwtAuthGuard } from "#modules/auth/guards/jwt-auth.guard.js";
import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { type Request as ExpressRequest } from "express";

import { CreateRoomDto } from "./rooms.dto.js";
import { RoomsService } from "./rooms.service.js";

@Controller("api/rooms")
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(
    @Body() createRoomDto: CreateRoomDto,
    @Request()
    req: ExpressRequest & {
      user: {
        sub: string;
      };
    },
  ) {
    const ownerId = req.user.sub; // user ID from JWT payload
    return this.roomsService.create(createRoomDto, ownerId);
  }

  @Get(":roomCode")
  findOne(@Param("roomCode") roomCode: string) {
    return this.roomsService.findByCode(roomCode);
  }
}
