import { Injectable, OnModuleInit } from "@nestjs/common";
import { tap } from "rxjs/operators";
import { Server, Socket } from "socket.io";

import { RedisService } from "../redis/redis.service.js";
import { SocketStateService } from "../socket-state/socket-state.service.js";
import {
  REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
  REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
  REDIS_SOCKET_EVENT_PROPAGATE_NAME,
  RedisPropagationType,
} from "./redis-propagator.constants.js";
import { RedisSocketEventEmitDTO, RedisSocketEventPropagateDTO } from "./redis-propagator.dto.js";

@Injectable()
export class RedisPropagatorService implements OnModuleInit {
  private socketServer?: Server;

  public constructor(
    private readonly socketStateService: SocketStateService,
    private readonly redisService: RedisService,
  ) {}

  public async emitToAll(eventInfo: RedisSocketEventEmitDTO): Promise<boolean> {
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, eventInfo);

    return true;
  }

  public async emitToAuthenticated(eventInfo: RedisSocketEventEmitDTO): Promise<boolean> {
    await this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME, eventInfo);

    return true;
  }

  public injectSocketServer(server: Server): this {
    this.socketServer = server;
    return this;
  }

  onModuleInit() {
    this.redisService.fromEvent<RedisSocketEventPropagateDTO>(REDIS_SOCKET_EVENT_PROPAGATE_NAME).pipe(tap(this.consumePropagateEvent)).subscribe();
  }

  public async propagateEvent(eventInfo: RedisSocketEventPropagateDTO): Promise<boolean> {
    if (!eventInfo.event || typeof eventInfo.data === "undefined") {
      console.warn("Attempted to propagate event with missing event name or data.", eventInfo);
      return false;
    }

    switch (eventInfo.type) {
      case RedisPropagationType.EMIT_TO_ROOM:
        if (!eventInfo.roomCode) {
          console.warn("Missing roomCode for EMIT_TO_ROOM propagation type.", eventInfo);
          return false;
        }
        break;
      case RedisPropagationType.SEND_TO_USER:
        if (!eventInfo.userId) {
          console.warn("Missing userId for SEND_TO_USER propagation type.", eventInfo);
          return false;
        }
        break;
    }

    await this.redisService.publish(REDIS_SOCKET_EVENT_PROPAGATE_NAME, eventInfo);
    return true;
  }

  private consumePropagateEvent = (eventInfo: RedisSocketEventPropagateDTO): void => {
    if (!this.socketServer) {
      console.warn("Socket server not injected in RedisPropagatorService.");
      return;
    }

    const { data, event, exceptSocketId, roomCode, type, userId } = eventInfo;

    let targetSockets: Socket[] | undefined;

    switch (type) {
      case RedisPropagationType.EMIT_TO_ALL:
        // Use the Socket.IO server's emit directly
        this.socketServer.emit(event, data);
        break;

      case RedisPropagationType.EMIT_TO_AUTHENTICATED:
        // Iterate through all authenticated sockets and emit
        this.socketStateService.getAll().forEach((socket) => {
          socket.emit(event, data);
        });
        break;

      case RedisPropagationType.EMIT_TO_ROOM:
        if (roomCode) {
          const roomTarget = this.socketServer.to(roomCode);
          if (exceptSocketId) {
            roomTarget.except(exceptSocketId).emit(event, data);
          } else {
            roomTarget.emit(event, data);
          }
        }
        break;

      case RedisPropagationType.SEND_TO_USER:
        if (userId) {
          targetSockets = this.socketStateService.get(userId);
          // Filter out the originating socket if exceptSocketId is provided
          if (exceptSocketId) {
            targetSockets = targetSockets.filter((socket) => socket.id !== exceptSocketId);
          }
          targetSockets.forEach((socket) => socket.emit(event, data));
        }
        break;

      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.warn(`Unknown propagation type: ${type}`);
        break;
    }
  };
}
