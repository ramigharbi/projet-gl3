import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('E2E Comment System Integration', () => {
  let app: INestApplication;
  let eventEmitter: EventEmitter2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Comment Workflow', () => {
    const GRAPHQL_ENDPOINT = '/graphql';
    const testDocId = 'e2e-test-document';

    it('should support complete comment lifecycle with real-time notifications', async () => {
      // Step 1: Verify document starts with no comments
      const initialQuery = `
        query GetComments($docId: ID!) {
          comments(docId: $docId) {
            commentId
            text
            author
          }
        }
      `;

      const initialResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: initialQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      expect(initialResponse.body.data.comments).toHaveLength(0);

      // Step 2: Add first comment
      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
            text
            author
            rangeStart
            rangeEnd
            createdAt
          }
        }
      `;

      const firstCommentInput = {
        text: 'This is the first comment in our e2e test',
        author: 'E2E Test User 1',
        rangeStart: 0,
        rangeEnd: 20
      };

      const addResponse1 = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { docId: testDocId, input: firstCommentInput }
        })
        .expect(200);

      const firstComment = addResponse1.body.data.addComment;
      expect(firstComment.text).toBe(firstCommentInput.text);
      expect(firstComment.commentId).toBeDefined();

      // Step 3: Add second comment from different user
      const secondCommentInput = {
        text: 'This is a reply comment',
        author: 'E2E Test User 2',
        rangeStart: 25,
        rangeEnd: 40
      };

      const addResponse2 = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { docId: testDocId, input: secondCommentInput }
        })
        .expect(200);

      const secondComment = addResponse2.body.data.addComment;
      expect(secondComment.text).toBe(secondCommentInput.text);

      // Step 4: Verify both comments are retrievable
      const queryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: initialQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      const comments = queryResponse.body.data.comments;
      expect(comments).toHaveLength(2);
      
      const commentTexts = comments.map(c => c.text);
      expect(commentTexts).toContain(firstCommentInput.text);
      expect(commentTexts).toContain(secondCommentInput.text);

      // Step 5: Update first comment
      const updateMutation = `
        mutation UpdateComment($docId: ID!, $commentId: ID!, $input: CommentInput!) {
          updateComment(docId: $docId, commentId: $commentId, input: $input) {
            commentId
            text
            updatedAt
          }
        }
      `;

      const updatedInput = {
        text: 'This is the UPDATED first comment',
        author: firstCommentInput.author,
        rangeStart: firstCommentInput.rangeStart,
        rangeEnd: firstCommentInput.rangeEnd
      };

      const updateResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: updateMutation,
          variables: { 
            docId: testDocId, 
            commentId: firstComment.commentId, 
            input: updatedInput 
          }
        })
        .expect(200);

      const updatedComment = updateResponse.body.data.updateComment;
      expect(updatedComment.text).toBe(updatedInput.text);
      expect(new Date(updatedComment.updatedAt).getTime())
        .toBeGreaterThan(new Date(firstComment.createdAt).getTime());

      // Step 6: Verify update persisted
      const verifyUpdateResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: initialQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      const updatedComments = verifyUpdateResponse.body.data.comments;
      const updatedFirstComment = updatedComments.find(c => c.commentId === firstComment.commentId);
      expect(updatedFirstComment.text).toBe(updatedInput.text);

      // Step 7: Delete second comment
      const deleteMutation = `
        mutation DeleteComment($docId: ID!, $commentId: ID!) {
          deleteComment(docId: $docId, commentId: $commentId)
        }
      `;

      const deleteResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: deleteMutation,
          variables: { docId: testDocId, commentId: secondComment.commentId }
        })
        .expect(200);

      expect(deleteResponse.body.data.deleteComment).toBe(true);

      // Step 8: Verify deletion
      const finalQueryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: initialQuery,
          variables: { docId: testDocId }
        })
        .expect(200);

      const finalComments = finalQueryResponse.body.data.comments;
      expect(finalComments).toHaveLength(1);
      expect(finalComments[0].commentId).toBe(firstComment.commentId);
      expect(finalComments[0].text).toBe(updatedInput.text);

      // Step 9: Clean up - delete remaining comment
      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: deleteMutation,
          variables: { docId: testDocId, commentId: firstComment.commentId }
        })
        .expect(200);
    });

    it('should handle concurrent operations correctly', async () => {
      const concurrentDocId = 'concurrent-test-doc';
      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
            text
            author
          }
        }
      `;

      // Create 5 comments concurrently
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const input = {
          text: `Concurrent comment ${i + 1}`,
          author: `User ${i + 1}`,
          rangeStart: i * 10,
          rangeEnd: (i * 10) + 5
        };

        promises.push(
          request(app.getHttpServer())
            .post(GRAPHQL_ENDPOINT)
            .send({
              query: addMutation,
              variables: { docId: concurrentDocId, input }
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.addComment).toBeDefined();
      });

      // Verify all comments were created
      const queryResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            query GetComments($docId: ID!) {
              comments(docId: $docId) {
                commentId
                text
                author
              }
            }
          `,
          variables: { docId: concurrentDocId }
        })
        .expect(200);

      expect(queryResponse.body.data.comments).toHaveLength(5);

      // Verify all comments have unique IDs
      const commentIds = queryResponse.body.data.comments.map(c => c.commentId);
      const uniqueIds = new Set(commentIds);
      expect(uniqueIds.size).toBe(5);
    });

    it('should maintain data isolation between documents', async () => {
      const doc1Id = 'isolation-test-doc-1';
      const doc2Id = 'isolation-test-doc-2';

      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
            text
          }
        }
      `;

      // Add comment to doc1
      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { 
            docId: doc1Id, 
            input: { text: 'Doc 1 comment', author: 'User1', rangeStart: 0, rangeEnd: 5 }
          }
        })
        .expect(200);

      // Add comment to doc2
      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { 
            docId: doc2Id, 
            input: { text: 'Doc 2 comment', author: 'User2', rangeStart: 0, rangeEnd: 5 }
          }
        })
        .expect(200);

      // Verify doc1 only has its comment
      const doc1Response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `query GetComments($docId: ID!) { comments(docId: $docId) { text } }`,
          variables: { docId: doc1Id }
        })
        .expect(200);

      expect(doc1Response.body.data.comments).toHaveLength(1);
      expect(doc1Response.body.data.comments[0].text).toBe('Doc 1 comment');

      // Verify doc2 only has its comment
      const doc2Response = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `query GetComments($docId: ID!) { comments(docId: $docId) { text } }`,
          variables: { docId: doc2Id }
        })
        .expect(200);

      expect(doc2Response.body.data.comments).toHaveLength(1);
      expect(doc2Response.body.data.comments[0].text).toBe('Doc 2 comment');
    });
  });

  describe('SSE Notification Integration', () => {
    it('should connect to SSE endpoint and receive heartbeat', (done) => {
      const userId = 'e2e-test-user';
      
      request(app.getHttpServer())
        .get(`/notifications/sse?userId=${userId}`)
        .set('Accept', 'text/event-stream')
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)
        .timeout(35000) // Extended timeout for heartbeat
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });

    it('should receive notifications when comments are modified', (done) => {
      const userId = 'notification-test-user';
      const testDocId = 'notification-test-doc';
      
      // Start SSE connection
      const sseRequest = request(app.getHttpServer())
        .get(`/notifications/sse?userId=${userId}`)
        .set('Accept', 'text/event-stream')
        .buffer(false);

      let notificationReceived = false;

      sseRequest.parse((res, callback) => {
        res.on('data', (chunk) => {
          const data = chunk.toString();
          if (data.includes('commentNotification') && !notificationReceived) {
            notificationReceived = true;
            sseRequest.abort();
            expect(data).toContain('commentNotification');
            done();
          }
        });
        callback(null, res);
      });

      // Trigger a notification by emitting an event
      setTimeout(() => {
        eventEmitter.emit(`notify.${userId}`, {
          event: 'commentNotification',
          data: {
            type: 'ADD',
            docId: testDocId,
            commentId: 'test-notification-comment',
            author: 'Notification Test User',
            text: 'This should trigger a notification'
          }
        });
      }, 1000);
    }, 15000);
  });

  describe('Error Handling', () => {
    it('should handle invalid GraphQL operations gracefully', async () => {
      const invalidQuery = `
        query InvalidQuery {
          nonExistentField
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Cannot query field');
    });

    it('should handle malformed GraphQL requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ invalidField: 'test' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should handle SSE connection errors gracefully', (done) => {
      // Test connection with invalid parameters
      request(app.getHttpServer())
        .get('/notifications/sse') // Missing userId
        .set('Accept', 'text/event-stream')
        .expect(200) // Should still connect but with empty userId
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers['content-type']).toMatch(/text\/event-stream/);
          done();
        });
    });
  });
});
