import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { customAlphabet } from "nanoid";
import { Repository } from "typeorm";

import { Room } from "./entities/room.entity.js";
import { CreateRoomDto } from "./rooms.dto.js";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private UserRepository: Repository<Room>) {}

  async create(createRoomDto: CreateRoomDto, ownerId: string) {
    const roomCode = nanoid();
    const createdRoom = this.UserRepository.create({
      ownerId: ownerId,
      roomCode: roomCode,
      roomName: createRoomDto.roomName,
    });
    return await this.UserRepository.save(createdRoom);
  }

  async findByCode(roomCode: string) {
    const room = await this.UserRepository.findOneBy({
      roomCode,
    });
    if (!room) {
      throw new NotFoundException(`Room with code ${roomCode} not found`);
    }
    return room;
  }
}
