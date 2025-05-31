import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CommentService } from '../src/comment/comment.service';
import { NotificationService } from '../src/notification/notification.service';

describe('Comment Integration Tests', () => {
  let app: INestApplication;
  let commentService: CommentService;
  let notificationService: NotificationService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commentService = moduleFixture.get<CommentService>(CommentService);
    notificationService = moduleFixture.get<NotificationService>(NotificationService);
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Comment Flow', () => {
    const GRAPHQL_ENDPOINT = '/graphql';
    const testDocId = 'integration-test-doc';

    it('should complete full comment lifecycle: add -> query -> update -> delete', async () => {
      // 1. Add a comment
      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
            docId
            text
            author
            rangeStart
            rangeEnd
            createdAt
            updatedAt
          }
        }
      `;

      const commentInput = {
        text: 'Integration test comment',
        author: 'integration-tester',
        rangeStart: 5,
        rangeEnd: 15
      };

      const addResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { docId: testDocId, input: commentInput }
        })
        .expect(200);

      const addedComment = addResponse.body.data.addComment;
      expect(addedComment.text).toBe(commentInput.text);
      expect(addedComment.author).toBe(commentInput.author);
      expect(addedComment.commentId).toBeDefined();

      // 2. Query comments to verify it was added
      const getQuery = `
        query GetComments($docId: ID!) {
          comments(docId: $docId) {
            commentId
            text
            author
            rangeStart
            rangeEnd
          }
        }
      `;

      const queryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: getQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      const comments = queryResponse.body.data.comments;
      expect(comments).toHaveLength(1);
      expect(comments[0].commentId).toBe(addedComment.commentId);

      // 3. Update the comment
      const updateMutation = `
        mutation UpdateComment($docId: ID!, $commentId: ID!, $input: CommentInput!) {
          updateComment(docId: $docId, commentId: $commentId, input: $input) {
            commentId
            text
            author
            updatedAt
          }
        }
      `;

      const updateInput = {
        text: 'Updated integration test comment',
        author: commentInput.author,
        rangeStart: commentInput.rangeStart,
        rangeEnd: commentInput.rangeEnd
      };

      const updateResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: updateMutation,
          variables: { 
            docId: testDocId, 
            commentId: addedComment.commentId, 
            input: updateInput 
          }
        })
        .expect(200);

      const updatedComment = updateResponse.body.data.updateComment;
      expect(updatedComment.text).toBe(updateInput.text);
      expect(updatedComment.commentId).toBe(addedComment.commentId);

      // 4. Delete the comment
      const deleteMutation = `
        mutation DeleteComment($docId: ID!, $commentId: ID!) {
          deleteComment(docId: $docId, commentId: $commentId)
        }
      `;

      const deleteResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: deleteMutation,
          variables: { docId: testDocId, commentId: addedComment.commentId }
        })
        .expect(200);

      expect(deleteResponse.body.data.deleteComment).toBe(true);

      // 5. Verify comment was deleted
      const finalQueryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: getQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      expect(finalQueryResponse.body.data.comments).toHaveLength(0);
    });

    it('should handle multiple comments on same document', async () => {
      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
            text
            author
          }
        }
      `;

      const multiTestDoc = 'multi-comment-test-doc';
      const comments = [
        { text: 'First comment', author: 'user1', rangeStart: 0, rangeEnd: 5 },
        { text: 'Second comment', author: 'user2', rangeStart: 10, rangeEnd: 15 },
        { text: 'Third comment', author: 'user3', rangeStart: 20, rangeEnd: 25 }
      ];

      // Add multiple comments
      const addedComments: any[] = [];
      for (const comment of comments) {
        const response = await request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: addMutation,
            variables: { docId: multiTestDoc, input: comment }
          })
          .expect(200);
        
        addedComments.push(response.body.data.addComment);
      }

      // Query all comments
      const getQuery = `
        query GetComments($docId: ID!) {
          comments(docId: $docId) {
            commentId
            text
            author
            rangeStart
            rangeEnd
          }
        }
      `;

      const queryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: getQuery,
          variables: { docId: multiTestDoc }
        })
        .expect(200);

      const retrievedComments = queryResponse.body.data.comments;
      expect(retrievedComments).toHaveLength(3);
      
      // Verify all comments are present
      comments.forEach((originalComment, index) => {
        const found = retrievedComments.find(c => c.text === originalComment.text);
        expect(found).toBeDefined();
        expect(found.author).toBe(originalComment.author);
      });
    });

    it('should handle GraphQL errors gracefully', async () => {
      // Test with invalid input (missing required field)
      const invalidMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
          }
        }
      `;

      const invalidInput = {
        // Missing required fields
        text: 'Test'
        // author, rangeStart, rangeEnd missing
      };

      const response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: invalidMutation,
          variables: { docId: testDocId, input: invalidInput }
        })
        .expect(400); // GraphQL validation error

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Field');
    });
  });

  describe('Comment Service Direct Tests', () => {
    it('should handle concurrent operations safely', async () => {
      const testDoc = 'concurrent-test-doc';
        // Create multiple comments concurrently
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          commentService.add(testDoc, {
            text: `Concurrent comment ${i}`,
            author: `user${i}`,
            rangeStart: i * 10,
            rangeEnd: (i * 10) + 5
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      
      // Verify all comments were added
      const allComments = await commentService.getComments(testDoc);
      expect(allComments).toHaveLength(10);
      
      // Verify each comment has unique ID
      const commentIds = allComments.map(c => c.commentId);
      const uniqueIds = new Set(commentIds);
      expect(uniqueIds.size).toBe(10);
    });

    it('should maintain data consistency across operations', async () => {
      const testDoc = 'consistency-test-doc';
      
      // Add a comment
      const comment = await commentService.add(testDoc, {
        text: 'Consistency test',
        author: 'consistency-user',
        rangeStart: 0,
        rangeEnd: 10
      });

      // Verify it can be found by ID
      const foundComment = await commentService.findById(testDoc, comment.commentId);
      expect(foundComment).toEqual(comment);

      // Update the comment
      const updatedComment = await commentService.update(testDoc, comment.commentId, {
        text: 'Updated consistency test'
      });

      expect(updatedComment?.text).toBe('Updated consistency test');
      expect(updatedComment?.commentId).toBe(comment.commentId);

      // Verify the update persisted
      const refetchedComment = await commentService.findById(testDoc, comment.commentId);
      expect(refetchedComment?.text).toBe('Updated consistency test');

      // Delete the comment
      const deleteResult = await commentService.delete(testDoc, comment.commentId);
      expect(deleteResult).toBe(true);

      // Verify it's gone
      const deletedComment = await commentService.findById(testDoc, comment.commentId);
      expect(deletedComment).toBeNull();
    });
  });
});
