// Events emitted from the Client to the Server
export interface ClientToServerEvents {
  joinRoom: (payload: { roomId: string }, callback: (ack: { message?: string; status: "error" | "success" }) => void) => void;
  leaveRoom: (payload: { roomId: string }) => void;
}

// Inter-server events (optional, for Socket.IO adapters like Redis)
export interface InterServerEvents {
  ping: () => void;
}

// Events emitted from the Server to the Client
export interface ServerToClientEvents {
  message: (payload: { text: string; timestamp: number; userId: string }) => void;
  "notification.new": (notification: { message: string; type: string }) => void;
  userJoined: (payload: { userId: string; username: string }) => void;
  userLeft: (payload: { userId: string }) => void;
}

export interface SocketData {
  userId: string;
  username: string;
}
