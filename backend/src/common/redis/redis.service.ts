import { Inject, Injectable } from "@nestjs/common";
import { Observable, Observer } from "rxjs";
import { filter, map } from "rxjs/operators";

import { REDIS_PUBLISHER_CLIENT, REDIS_SUBSCRIBER_CLIENT } from "./redis.constants.js";
import { RedisClient } from "./redis.providers.js";

interface RedisSubscribeMessage {
  readonly channel: string;
  readonly message: string;
}

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_SUBSCRIBER_CLIENT) private readonly redisSubscriberClient: RedisClient,
    @Inject(REDIS_PUBLISHER_CLIENT) private readonly redisPublisherClient: RedisClient,
  ) {}

  public fromEvent<T>(eventName: string): Observable<T> {
    void this.redisSubscriberClient.subscribe(eventName);

    return new Observable((observer: Observer<RedisSubscribeMessage>) =>
      this.redisSubscriberClient.on("message", (channel, message) => {
        observer.next({ channel, message });
      }),
    ).pipe(
      filter(({ channel }) => channel === eventName),
      map(({ message }) => JSON.parse(message) as T),
    );
  }

  public async publish(channel: string, value: unknown): Promise<number> {
    return this.redisPublisherClient.publish(channel, JSON.stringify(value));
  }
}
