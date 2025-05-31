import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentInput } from './dto/comment.dto';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getComments', () => {
    it('should return empty array for new document', async () => {
      const result = await service.getComments('doc1');
      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add a comment successfully', async () => {
      const input: CommentInput = {
        text: 'Test comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const result = await service.add('doc1', input);

      expect(result).toMatchObject({
        text: 'Test comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
        docId: 'doc1',
      });
      expect(result.commentId).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const input: CommentInput = {
        text: 'Original comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const comment = await service.add('doc1', input);
      // Add a small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      const updatedComment = await service.update('doc1', comment.commentId, {
        text: 'Updated comment',
      });

      expect(updatedComment).toMatchObject({
        commentId: comment.commentId,
        text: 'Updated comment',
        author: 'testuser',
      });
      expect(updatedComment!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        comment.createdAt.getTime(),
      );
    });

    it('should return null for non-existent comment', async () => {
      const result = await service.update('doc1', 'nonexistent', {
        text: 'Updated',
      });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully', async () => {
      const input: CommentInput = {
        text: 'Test comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const comment = await service.add('doc1', input);
      const result = await service.delete('doc1', comment.commentId);

      expect(result).toBe(true);

      const comments = await service.getComments('doc1');
      expect(comments).toHaveLength(0);
    });

    it('should return false for non-existent comment', async () => {
      const result = await service.delete('doc1', 'nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find a comment by ID', async () => {
      const input: CommentInput = {
        text: 'Test comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10,
      };

      const comment = await service.add('doc1', input);
      const found = await service.findById('doc1', comment.commentId);

      expect(found).toEqual(comment);
    });

    it('should return null for non-existent comment', async () => {
      const result = await service.findById('doc1', 'nonexistent');
      expect(result).toBeNull();
    });
  });
});
