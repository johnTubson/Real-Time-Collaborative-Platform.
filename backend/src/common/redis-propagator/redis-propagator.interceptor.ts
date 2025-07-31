import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WsResponse } from "@nestjs/websockets";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { AuthenticatedSocket } from "../adapters/authenticated-socket.adapter.js";
import { PROPAGATE_EVENT_KEY, PropagateEventOptions } from "./propagate-event.decorator.js";
import { RedisPropagationType } from "./redis-propagator.constants.js";
import { RedisSocketEventPropagateDTO } from "./redis-propagator.dto.js";
import { RedisPropagatorService } from "./redis-propagator.service.js";

@Injectable()
export class RedisPropagatorInterceptor<T> implements NestInterceptor<T, WsResponse<T>> {
  public constructor(
    private readonly redisPropagatorService: RedisPropagatorService,
    private readonly reflector: Reflector, // <-- Inject Reflector
  ) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<WsResponse<T>> {
    const socket: AuthenticatedSocket = context.switchToWs().getClient();

    const propagateOptions = this.reflector.get<PropagateEventOptions | undefined>(PROPAGATE_EVENT_KEY, context.getHandler());

    // If the decorator is not present, don't do anything
    if (!propagateOptions) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // Construct the DTO based on the decorator options
        const propagateDTO: RedisSocketEventPropagateDTO = {
          data: data.data as object,
          event: data.event,
          exceptSocketId: propagateOptions.excludeSender ? socket.id : undefined,
          // Note: roomCode must be dynamically retrieved, see below
          roomCode: undefined, // Will be set dynamically
          type: propagateOptions.type,
          // Optional properties
          userId: socket.auth?.userId,
        };

        // Dynamic properties need to be handled here
        // This is a crucial part: the interceptor doesn't have direct access
        // to the @MessageBody() payload. We have to make a choice.
        // A common solution is to attach this data to the request or response,
        // or to standardize your DTOs to always include roomCode.
        // For this example, let's assume the WsResponse data or a custom
        // decorator can provide the roomCode.
        if (propagateOptions.type === RedisPropagationType.EMIT_TO_ROOM) {
          // This is a simplification. The real implementation depends on your DTOs.
          // For example, if your WsResponse data always contains a `roomCode` property:
          // propagateDTO.roomCode = (data.data as any).roomCode;
          // Or if you passed it via the decorator (less flexible):
          // propagateDTO.roomCode = propagateOptions.roomCode;

          // A more robust way: use a custom decorator on the payload
          // or pass the roomCode through the WsResponse data itself.
          // For this example, let's assume the payload includes the roomCode.
          const originalPayload = context.switchToWs().getData<RedisSocketEventPropagateDTO>();
          if (originalPayload.roomCode) {
            propagateDTO.roomCode = originalPayload.roomCode;
          } else {
            console.warn("Propagation to room requested, but no roomCode found in payload.", originalPayload);
            return;
          }
        }

        void this.redisPropagatorService.propagateEvent(propagateDTO);
      }),
    );
  }
}
