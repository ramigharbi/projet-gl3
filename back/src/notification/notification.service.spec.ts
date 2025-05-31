import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('NotificationService', () => {
  let service: NotificationService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyOnComment', () => {
    it('should emit notification event for a user', () => {
      const userId = 'test-user';
      const notification = {
        type: 'ADD' as const,
        docId: 'test-doc',
        commentId: 'test-comment',
        author: 'test-author',
        text: 'Test comment text',
      };

      service.notifyOnComment(userId, notification);

      expect(eventEmitter.emit).toHaveBeenCalledWith(`notify.${userId}`, {
        event: 'commentNotification',
        data: notification,
      });
    });

    it('should handle different notification types', () => {
      const userId = 'test-user';
      const types = ['ADD', 'UPDATE', 'DELETE'] as const;

      types.forEach((type) => {
        const notification = {
          type,
          docId: 'test-doc',
          commentId: 'test-comment',
          author: 'test-author',
          text: type === 'DELETE' ? undefined : 'Test comment text',
        };

        service.notifyOnComment(userId, notification);

        expect(eventEmitter.emit).toHaveBeenCalledWith(`notify.${userId}`, {
          event: 'commentNotification',
          data: notification,
        });
      });
    });
  });

  describe('notifyAllUsers', () => {
    it('should emit notifications to multiple users', () => {
      const userIds = ['user1', 'user2', 'user3'];
      const notification = {
        type: 'ADD' as const,
        docId: 'test-doc',
        commentId: 'test-comment',
        author: 'test-author',
        text: 'Test comment text',
      };

      service.notifyAllUsers(userIds, notification);

      userIds.forEach((userId) => {
        expect(eventEmitter.emit).toHaveBeenCalledWith(`notify.${userId}`, {
          event: 'commentNotification',
          data: notification,
        });
      });

      expect(eventEmitter.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle empty user list', () => {
      const notification = {
        type: 'ADD' as const,
        docId: 'test-doc',
        commentId: 'test-comment',
        author: 'test-author',
        text: 'Test comment text',
      };

      service.notifyAllUsers([], notification);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle notifications without text (delete operations)', () => {
      const userIds = ['user1'];
      const notification = {
        type: 'DELETE' as const,
        docId: 'test-doc',
        commentId: 'test-comment',
        author: 'test-author',
      };

      service.notifyAllUsers(userIds, notification);

      expect(eventEmitter.emit).toHaveBeenCalledWith('notify.user1', {
        event: 'commentNotification',
        data: notification,
      });
    });
  });
});
