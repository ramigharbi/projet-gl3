import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('GraphQL Comments', () => {
    const GRAPHQL_ENDPOINT = '/graphql';

    it('should fetch comments for a document', async () => {
      const query = `
        query GetComments($docId: ID!) {
          comments(docId: $docId) {
            commentId
            docId
            text
            author
            rangeStart
            rangeEnd
          }
        }
      `;

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query,
          variables: { docId: 'test-doc' }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data.comments).toEqual([]);
        });
    });

    it('should add a comment and return it', async () => {
      const mutation = `
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

      const input = {
        text: 'Test comment',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 10
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: mutation,
          variables: { docId: 'test-doc', input }
        })
        .expect(200)
        .then(response => {
          const comment = response.body.data.addComment;
          expect(comment.text).toBe('Test comment');
          expect(comment.author).toBe('testuser');
          expect(comment.docId).toBe('test-doc');
          expect(comment.commentId).toBeDefined();
        });
    });

    it('should delete a comment successfully', async () => {
      // First add a comment
      const addMutation = `
        mutation AddComment($docId: ID!, $input: CommentInput!) {
          addComment(docId: $docId, input: $input) {
            commentId
          }
        }
      `;

      const input = {
        text: 'Comment to delete',
        author: 'testuser',
        rangeStart: 0,
        rangeEnd: 5
      };

      const addResponse = await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: addMutation,
          variables: { docId: 'test-doc-delete', input }
        });

      const commentId = addResponse.body.data.addComment.commentId;

      // Then delete it
      const deleteMutation = `
        mutation DeleteComment($docId: ID!, $commentId: ID!) {
          deleteComment(docId: $docId, commentId: $commentId)
        }
      `;

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: deleteMutation,
          variables: { docId: 'test-doc-delete', commentId }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data.deleteComment).toBe(true);
        });
    });

    it('should return false when deleting non-existent comment', async () => {
      const deleteMutation = `
        mutation DeleteComment($docId: ID!, $commentId: ID!) {
          deleteComment(docId: $docId, commentId: $commentId)
        }
      `;

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: deleteMutation,
          variables: { docId: 'test-doc', commentId: 'non-existent' }
        })
        .expect(200)
        .then(response => {
          expect(response.body.data.deleteComment).toBe(false);
        });
    });
  });

  describe('SSE Notifications', () => {
    it('should establish SSE connection', (done) => {
      const userId = 'test-user';
      
      request(app.getHttpServer())
        .get(`/notifications/sse?userId=${userId}`)
        .set('Accept', 'text/event-stream')
        .expect(200)
        .expect('Content-Type', /text\/event-stream/)
        .end((err, res) => {
          if (err) return done(err);
          
          // Connection should be established
          expect(res.headers['content-type']).toMatch(/text\/event-stream/);
          done();
        });
    });

    it('should receive heartbeat events', (done) => {
      const userId = 'test-user-heartbeat';
      let heartbeatReceived = false;
      
      const req = request(app.getHttpServer())
        .get(`/notifications/sse?userId=${userId}`)
        .set('Accept', 'text/event-stream')
        .buffer(false)
        .parse((res, callback) => {
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('heartbeat')) {
              heartbeatReceived = true;
              req.abort();
              expect(heartbeatReceived).toBe(true);
              done();
            }
          });
          callback(null, res);
        });
    }, 35000); // Extended timeout for heartbeat

    it('should receive comment notifications via SSE', (done) => {
      const userId = 'test-user-notify';
      let notificationReceived = false;
      
      const req = request(app.getHttpServer())
        .get(`/notifications/sse?userId=${userId}`)
        .set('Accept', 'text/event-stream')
        .buffer(false)
        .parse((res, callback) => {
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('commentNotification')) {
              notificationReceived = true;
              req.abort();
              expect(notificationReceived).toBe(true);
              done();
            }
          });
          callback(null, res);
        });

      // Emit a test notification after a short delay
      setTimeout(() => {
        eventEmitter.emit(`notify.${userId}`, {
          event: 'commentNotification',
          data: {
            type: 'ADD',
            docId: 'test-doc',
            commentId: 'test-comment',
            author: 'testuser',
            text: 'Test notification'
          }
        });
      }, 1000);
    }, 10000);
  });
});
