import { SetMetadata } from "@nestjs/common";

import { RedisPropagationType } from "./redis-propagator.constants.js";

export interface PropagateEventOptions {
  excludeSender?: boolean;
  roomCode?: string;
  type: RedisPropagationType;
}

export const PROPAGATE_EVENT_KEY = "propagate_event_key";

export const PropagateEvent = (options: PropagateEventOptions) => SetMetadata(PROPAGATE_EVENT_KEY, options);
