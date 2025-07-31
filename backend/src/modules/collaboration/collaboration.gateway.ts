import { PropagateEvent } from "#common/redis-propagator/propagate-event.decorator.js";
import { RedisPropagationType } from "#common/redis-propagator/redis-propagator.constants.js";
import { RedisPropagatorInterceptor } from "#common/redis-propagator/redis-propagator.interceptor.js";
import { RedisPropagatorService } from "#common/redis-propagator/redis-propagator.service.js";
import { REDIS_PUBLISHER_CLIENT } from "#common/redis/redis.constants.js";
import { RedisClient } from "#common/redis/redis.providers.js";
import { Inject, Logger, UseInterceptors } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Server, Socket } from "socket.io";

import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../../shared/socket-types.js";
import { RoomsService } from "../rooms/rooms.service.js";

class CodeChangeDto {
  @IsString() newCode!: string;
  @IsNotEmpty() @IsString() roomCode!: string;
}

class CursorMoveDto {
  @IsObject() position!: { x: number; y: number };
  @IsNotEmpty() @IsString() roomCode!: string;
  @IsNotEmpty() @IsString() userId!: string;
}

class DrawActionDto {
  @IsObject() actionData!: object;
  @IsNotEmpty() @IsString() roomCode!: string;
}

class JoinRoomDto {
  @IsNotEmpty() @IsString() roomCode!: string;
  @IsObject() user!: UserPayloadDto;
}

class UserPayloadDto {
  @IsNotEmpty() @IsString() id!: string;
  @IsNotEmpty() @IsString() username!: string;
}

// --- Redis Key Generation Functions ---
const roomUsersKey = (roomCode: string) => `room:${roomCode}:users`;
const roomCodeKey = (roomCode: string) => `room:${roomCode}:code`;
const roomDrawActionsKey = (roomCode: string) => `room:${roomCode}:draw_actions`;
const clientRoomKey = (clientId: string) => `client:${clientId}:room`;

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
// type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, SocketData>;

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway({ cors: { origin: "*" }, namespace: "/collaboration" })
export class CollaborationGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: TypedServer;

  private readonly logger = new Logger(CollaborationGateway.name);

  constructor(
    @Inject(REDIS_PUBLISHER_CLIENT) private readonly redisPublisherClient: RedisClient,
    private readonly redisPropagatorService: RedisPropagatorService,
    private readonly roomsService: RoomsService,
  ) {}

  @PropagateEvent({ excludeSender: true, type: RedisPropagationType.EMIT_TO_ROOM })
  @SubscribeMessage("code_change")
  async handleCodeChange(@MessageBody() payload: CodeChangeDto): Promise<WsResponse> {
    const { newCode, roomCode } = payload;
    await this.redisPublisherClient.set(roomCodeKey(roomCode), newCode);
    return {
      data: {
        newCode,
        roomCode,
      },
      event: "code_update",
    };
  }

  @PropagateEvent({ excludeSender: true, type: RedisPropagationType.EMIT_TO_ROOM })
  @SubscribeMessage("cursor_move")
  handleCursorMove(@MessageBody() payload: CursorMoveDto): WsResponse {
    const actionData = {
      position: payload.position,
      roomCode: payload.roomCode,
      userId: payload.userId,
    };
    return {
      data: actionData,
      event: "cursor_update",
    };
  }

  @PropagateEvent({ excludeSender: true, type: RedisPropagationType.EMIT_TO_ROOM })
  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const roomInfoStr = await this.redisPublisherClient.get(clientRoomKey(client.id));
    if (roomInfoStr) {
      const { roomCode, user } = JSON.parse(roomInfoStr) as {
        roomCode: string;
        user: UserPayloadDto;
      };

      // Remove user from the room's set in Redis
      await this.redisPublisherClient.srem(roomUsersKey(roomCode), JSON.stringify(user));

      // Clean up the client-to-room mapping
      await this.redisPublisherClient.del(clientRoomKey(client.id));

      // Get updated user list and notify the room
      const usersJson = await this.redisPublisherClient.smembers(roomUsersKey(roomCode));
      const users = usersJson.map((u) => JSON.parse(u) as UserPayloadDto);

      this.logger.log(`User ${user.username} removed from room ${roomCode}`);
      // Manually propagate the event using the service
      void this.redisPropagatorService.propagateEvent({
        data: { roomCode, users },
        event: "room_update",
        exceptSocketId: undefined,
        roomCode,
        type: RedisPropagationType.EMIT_TO_ROOM,
      });
    }
  }

  @PropagateEvent({ excludeSender: true, type: RedisPropagationType.EMIT_TO_ROOM })
  @SubscribeMessage("draw_action")
  async handleDrawAction(@MessageBody() payload: DrawActionDto): Promise<WsResponse> {
    const { actionData, roomCode } = payload;
    await this.redisPublisherClient.lpush(roomDrawActionsKey(roomCode), JSON.stringify(actionData));
    return {
      data: {
        roomCode,
        ...actionData,
      },
      event: "draw_event",
    };
  }

  @PropagateEvent({ excludeSender: true, type: RedisPropagationType.EMIT_TO_ROOM })
  @SubscribeMessage("join_room")
  async handleJoinRoom(@MessageBody() payload: JoinRoomDto, @ConnectedSocket() client: Socket): Promise<Observable<WsResponse>> {
    const { roomCode, user } = payload;
    this.logger.log(`User ${user.username} attempting to join room ${roomCode}`);

    const roomExists = await this.roomsService.findByCode(roomCode).catch(() => null);
    if (!roomExists) {
      this.logger.warn(`Attempt to join non-existent room: ${roomCode}`);
      return from([{ data: { message: `Room ${roomCode} not found.` }, event: "error" }]);
    }

    await client.join(roomCode);

    await this.redisPublisherClient.sadd(roomUsersKey(roomCode), JSON.stringify(user));
    await this.redisPublisherClient.set(clientRoomKey(client.id), JSON.stringify({ roomCode, user }));

    const usersJson = await this.redisPublisherClient.smembers(roomUsersKey(roomCode));
    const users = usersJson.map((u) => JSON.parse(u) as UserPayloadDto);

    const currentCode = await this.redisPublisherClient.get(roomCodeKey(roomCode));
    const drawActionsJson = await this.redisPublisherClient.lrange(roomDrawActionsKey(roomCode), 0, -1);
    const drawActions = drawActionsJson.map((a) => JSON.parse(a) as object).reverse();

    // Send initial state directly to the joining client. This should NOT be propagated.
    client.emit("initial_state", {
      currentCode: currentCode ?? "",
      drawActions,
      roomCode,
      users,
    });

    return from([{ roomCode, users }]).pipe(
      map((data) => ({
        data,
        event: "room_update",
      })),
    );
  }
}
