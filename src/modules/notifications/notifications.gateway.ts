import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export type NotificationEvent = {
  tenantId: string;
  userId: string;
  type: string;
    message?: string;

  payload: any;
};

@Injectable()
export class NotificationsGateway {
  private streams = new Map<string, Subject<NotificationEvent>>();

  private key(tenantId: string, userId: string) {
    return `${tenantId}:${userId}`;
  }

  getStream(tenantId: string, userId: string) {
    const k = this.key(tenantId, userId);
    if (!this.streams.has(k)) {
      this.streams.set(k, new Subject());
    }
    return this.streams.get(k)!;
  }

  emit(event: NotificationEvent) {
    const stream = this.streams.get(
      this.key(event.tenantId, event.userId),
    );
    if (stream) {
      stream.next(event);
    }
  }
}
