import { Socket } from "socket.io";

export type AuthenticatedSocket = Socket & { auth: AuthPayload | null };
export interface AuthPayload {
  userId: string;
}
