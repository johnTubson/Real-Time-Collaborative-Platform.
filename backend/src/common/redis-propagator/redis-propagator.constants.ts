export const REDIS_SOCKET_EVENT_SEND_NAME = "REDIS_SOCKET_EVENT_SEND_NAME";
export const REDIS_SOCKET_EVENT_EMIT_ALL_NAME = "REDIS_SOCKET_EVENT_EMIT_ALL_NAME";
export const REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME = "REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME";
export const REDIS_SOCKET_EVENT_PROPAGATE_NAME = "propagate_event";

export enum RedisPropagationType {
  EMIT_TO_ALL = "emit_to_all", // To all connected clients
  EMIT_TO_AUTHENTICATED = "emit_to_authenticated", // To all authenticated clients
  EMIT_TO_ROOM = "emit_to_room", // To clients in a specific room
  SEND_TO_USER = "send_to_user", // To a specific user's other connections
}
