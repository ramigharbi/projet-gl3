import { Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('notifications')
export class NotificationController {
  constructor(private eventEmitter: EventEmitter2) {}

  @Sse('sse')
  sse(@Query('userId') userId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      const eventName = `notify.${userId}`;

      const listener = (data: any) => {
        observer.next({
          type: data.event,
          data: JSON.stringify(data.data),
        });
      };

      this.eventEmitter.on(eventName, listener);

      // Send a heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        observer.next({
          type: 'heartbeat',
          data: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }, 30000);

      // Clean up on disconnect
      return () => {
        this.eventEmitter.off(eventName, listener);
        clearInterval(heartbeat);
      };
    });
  }
}
