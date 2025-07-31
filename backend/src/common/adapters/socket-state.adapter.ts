import { JwtPayload } from "#modules/auth/strategies/jwt.strategy.js";
import { INestApplicationContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";
import * as socketio from "socket.io";

import { RedisPropagatorService } from "../redis-propagator/redis-propagator.service.js";
import { SocketStateService } from "../socket-state/socket-state.service.js";
import { AuthenticatedSocket, AuthPayload } from "./authenticated-socket.adapter.js";

export class SocketStateAdapter extends IoAdapter {
  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
  ) {
    super(app);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  bindClientConnect(server: socketio.Server, callback: Function): void {
    server.on("connection", (socket) => {
      if ("auth" in socket) {
        const socketAuth = socket.auth as AuthPayload;
        this.socketStateService.add(socketAuth.userId, socket as AuthenticatedSocket);
        socket.on("disconnect", () => {
          if (socket.auth) this.socketStateService.remove(socketAuth.userId, socket as AuthenticatedSocket);
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(socket);
    });
  }

  create(port: number, options = {} as socketio.ServerOptions): socketio.Server {
    const server = super.createIOServer(port, { ...options, cors: { origin: "*" } }) as socketio.Server;
    this.redisPropagatorService.injectSocketServer(server);

    const jwtService = this.app.get(JwtService);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use(async (socket, next) => {
      const token = (socket.handshake.auth.token as null | string | undefined) ?? socket.handshake.headers.authorization;
      if (!token) {
        (socket as AuthenticatedSocket).auth = null;
        next();
        return; // Allow unauthenticated connections
      }
      try {
        const payload = await jwtService.verifyAsync<JwtPayload>(token.replace("Bearer ", ""));
        (socket as AuthenticatedSocket).auth = { userId: payload.sub }; // Attach user ID from JWT
        next();
      } catch {
        next(new Error("Forbidden"));
      }
    });

    return server;
  }
}
