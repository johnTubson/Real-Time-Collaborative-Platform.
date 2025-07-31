import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";

import { RedisPropagationType } from "./redis-propagator.constants.js";

export class RedisSocketEventEmitDTO {
  public readonly data: unknown;
  public readonly event!: string;
}
export class RedisSocketEventPropagateDTO {
  @IsObject()
  public readonly data!: object; // The payload of the Socket.IO event

  @IsString()
  public readonly event!: string; // The actual Socket.IO event name

  @IsOptional()
  @IsString()
  public readonly exceptSocketId?: string; // Optional: To exclude a specific socket (e.g., the sender)

  @IsOptional()
  @IsString()
  public roomCode?: string; // Required for EMIT_TO_ROOM, optional otherwise

  @IsEnum(RedisPropagationType)
  public readonly type!: RedisPropagationType;

  @IsOptional()
  @IsString()
  public readonly userId?: string; // Required for SEND_TO_USER, optional otherwise
}

export class RedisSocketEventSendDTO extends RedisSocketEventEmitDTO {
  public readonly socketId!: string;
  public readonly userId!: string;
}
