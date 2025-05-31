import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CommentNotification {
  type: 'ADD' | 'DELETE' | 'UPDATE';
  docId: string;
  commentId: string;
  author: string;
  text?: string;
}

@Injectable()
export class NotificationService {
  constructor(private eventEmitter: EventEmitter2) {}

  notifyOnComment(userId: string, notification: CommentNotification): void {
    this.eventEmitter.emit(`notify.${userId}`, {
      event: 'commentNotification',
      data: notification,
    });
  }

  notifyAllUsers(userIds: string[], notification: CommentNotification): void {
    userIds.forEach((userId) => {
      this.notifyOnComment(userId, notification);
    });
  }
}
