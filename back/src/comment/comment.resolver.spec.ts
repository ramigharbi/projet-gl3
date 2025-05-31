import { Test, TestingModule } from '@nestjs/testing';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { NotificationService } from '../notification/notification.service';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub.provider';
import { Comment, CommentInput } from './dto/comment.dto';

describe('CommentResolver', () => {
  let resolver: CommentResolver;
  let commentService: CommentService;
  let notificationService: NotificationService;
  let pubSub: PubSub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentResolver,
        {
          provide: CommentService,
          useValue: {
            getComments: jest.fn(),
            add: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyAllUsers: jest.fn(),
          },
        },
        {
          provide: PUB_SUB,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<CommentResolver>(CommentResolver);
    commentService = module.get<CommentService>(CommentService);
    notificationService = module.get<NotificationService>(NotificationService);
    pubSub = module.get<PubSub>(PUB_SUB);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('comments', () => {
    it('should return comments for a document', async () => {
      const docId = 'test-doc';
      const expectedComments: Comment[] = [
        {
          commentId: '1',
          docId,
          text: 'Test comment',
          author: 'testuser',
          createdAt: new Date(),
          updatedAt: new Date(),
          rangeStart: 0,
          rangeEnd: 10,
        },
      ];

      jest.spyOn(commentService, 'getComments').mockResolvedValue(expectedComments);

      const result = await resolver.comments(docId);

      expect(result).toEqual(expectedComments);
      expect(commentService.getComments).toHaveBeenCalledWith(docId);
    });
  });

  describe('addComment', () => {
    it('should add a comment and send notifications', async () => {
      const docId = 'test-doc';
      const input: CommentInput = {
        text: 'New comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const expectedComment: Comment = {
        commentId: '1',
        docId,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(commentService, 'add').mockResolvedValue(expectedComment);

      const result = await resolver.addComment(docId, input);

      expect(result).toEqual(expectedComment);
      expect(commentService.add).toHaveBeenCalledWith(docId, input);
      expect(pubSub.publish).toHaveBeenCalledWith(`COMMENT_EVT:${docId}`, {
        commentEvent: {
          type: 'ADD',
          comment: expectedComment,
        },
      });
      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(['demo-user'], {
        type: 'ADD',
        docId,
        commentId: expectedComment.commentId,
        author: expectedComment.author,
        text: expectedComment.text,
      });
    });
  });

  describe('updateComment', () => {
    it('should update a comment and send notifications when comment exists', async () => {
      const docId = 'test-doc';
      const commentId = 'test-comment';
      const input: CommentInput = {
        text: 'Updated comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const expectedComment: Comment = {
        commentId,
        docId,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(commentService, 'update').mockResolvedValue(expectedComment);

      const result = await resolver.updateComment(docId, commentId, input);

      expect(result).toEqual(expectedComment);
      expect(commentService.update).toHaveBeenCalledWith(docId, commentId, input);
      expect(pubSub.publish).toHaveBeenCalledWith(`COMMENT_EVT:${docId}`, {
        commentEvent: {
          type: 'UPDATE',
          comment: expectedComment,
        },
      });
      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(['demo-user'], {
        type: 'UPDATE',
        docId,
        commentId: expectedComment.commentId,
        author: expectedComment.author,
        text: expectedComment.text,
      });
    });

    it('should return null and not send notifications when comment does not exist', async () => {
      const docId = 'test-doc';
      const commentId = 'nonexistent-comment';
      const input: CommentInput = {
        text: 'Updated comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      jest.spyOn(commentService, 'update').mockResolvedValue(null);

      const result = await resolver.updateComment(docId, commentId, input);

      expect(result).toBeNull();
      expect(commentService.update).toHaveBeenCalledWith(docId, commentId, input);
      expect(pubSub.publish).not.toHaveBeenCalled();
      expect(notificationService.notifyAllUsers).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment and send notifications when successful', async () => {
      const docId = 'test-doc';
      const commentId = 'test-comment';

      const existingComment: Comment = {
        commentId,
        docId,
        text: 'Comment to delete',
        author: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
        rangeStart: 0,
        rangeEnd: 10,
      };

      jest.spyOn(commentService, 'findById').mockResolvedValue(existingComment);
      jest.spyOn(commentService, 'delete').mockResolvedValue(true);

      const result = await resolver.deleteComment(docId, commentId);

      expect(result).toBe(true);
      expect(commentService.findById).toHaveBeenCalledWith(docId, commentId);
      expect(commentService.delete).toHaveBeenCalledWith(docId, commentId);
      expect(pubSub.publish).toHaveBeenCalledWith(`COMMENT_EVT:${docId}`, {
        commentEvent: {
          type: 'DELETE',
          commentId,
        },
      });
      expect(notificationService.notifyAllUsers).toHaveBeenCalledWith(['demo-user'], {
        type: 'DELETE',
        docId,
        commentId,
        author: existingComment.author,
        text: existingComment.text,
      });
    });

    it('should return false and not send notifications when deletion fails', async () => {
      const docId = 'test-doc';
      const commentId = 'nonexistent-comment';

      jest.spyOn(commentService, 'findById').mockResolvedValue(null);
      jest.spyOn(commentService, 'delete').mockResolvedValue(false);

      const result = await resolver.deleteComment(docId, commentId);

      expect(result).toBe(false);
      expect(commentService.findById).toHaveBeenCalledWith(docId, commentId);
      expect(commentService.delete).toHaveBeenCalledWith(docId, commentId);
      expect(pubSub.publish).not.toHaveBeenCalled();
      expect(notificationService.notifyAllUsers).not.toHaveBeenCalled();
    });

    it('should not send notifications when comment is found but deletion fails', async () => {
      const docId = 'test-doc';
      const commentId = 'test-comment';

      const existingComment: Comment = {
        commentId,
        docId,
        text: 'Comment to delete',
        author: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
        rangeStart: 0,
        rangeEnd: 10,
      };

      jest.spyOn(commentService, 'findById').mockResolvedValue(existingComment);
      jest.spyOn(commentService, 'delete').mockResolvedValue(false);

      const result = await resolver.deleteComment(docId, commentId);

      expect(result).toBe(false);
      expect(pubSub.publish).not.toHaveBeenCalled();
      expect(notificationService.notifyAllUsers).not.toHaveBeenCalled();
    });
  });
});
