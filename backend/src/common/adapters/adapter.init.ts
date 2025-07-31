import { INestApplication } from "@nestjs/common";

import { RedisPropagatorService } from "../redis-propagator/redis-propagator.service.js";
import { SocketStateService } from "../socket-state/socket-state.service.js";
import { SocketStateAdapter } from "./socket-state.adapter.js";

export const initAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);
  const redisPropagatorService = app.get(RedisPropagatorService);
  app.useWebSocketAdapter(new SocketStateAdapter(app, socketStateService, redisPropagatorService));
  return app;
};
