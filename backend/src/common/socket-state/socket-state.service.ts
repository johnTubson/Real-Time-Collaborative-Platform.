import { AuthenticatedSocket } from "#common/adapters/authenticated-socket.adapter.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SocketStateService {
  private readonly socketState = new Map<string, AuthenticatedSocket[]>();

  public add(userId: string, socket: AuthenticatedSocket): boolean {
    const existingSockets = this.socketState.get(userId) ?? [];
    const sockets = [...existingSockets, socket];
    this.socketState.set(userId, sockets);
    return true;
  }

  public get(userId: string): AuthenticatedSocket[] {
    return this.socketState.get(userId) ?? [];
  }

  public getAll(): AuthenticatedSocket[] {
    return [...this.socketState.values()].flat();
  }

  public remove(userId: string, socket: AuthenticatedSocket): boolean {
    const existingSockets = this.socketState.get(userId);
    if (!existingSockets) {
      return true;
    }
    const sockets = existingSockets.filter((s) => s.id !== socket.id);
    if (!sockets.length) {
      this.socketState.delete(userId);
    } else {
      this.socketState.set(userId, sockets);
    }
    return true;
  }
}
