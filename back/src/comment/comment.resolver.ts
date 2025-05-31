import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment, CommentInput } from './dto/comment.dto';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub.provider';
import { NotificationService } from '../notification/notification.service';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly notificationService: NotificationService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  @Query(() => [Comment], { name: 'comments' })
  async comments(
    @Args('docId', { type: () => ID }) docId: string,
  ): Promise<Comment[]> {
    return this.commentService.getComments(docId);
  }

  @Mutation(() => Comment, { name: 'addComment' })
  async addComment(
    @Args('docId', { type: () => ID }) docId: string,
    @Args('input') input: CommentInput,
  ): Promise<Comment> {
    const comment = await this.commentService.add(docId, input);

    // Publish GraphQL subscription event
    await this.pubSub.publish(`COMMENT_EVT:${docId}`, {
      commentEvent: {
        type: 'ADD',
        comment,
      },
    });

    // Send SSE notification to all users (in a real app, you'd filter by document access)
    const userIds = ['demo-user']; // In production, get actual user IDs from document access control
    this.notificationService.notifyAllUsers(userIds, {
      type: 'ADD',
      docId,
      commentId: comment.commentId,
      author: comment.author,
      text: comment.text,
    });

    return comment;
  }

  @Mutation(() => Comment, { name: 'updateComment', nullable: true })
  async updateComment(
    @Args('docId', { type: () => ID }) docId: string,
    @Args('commentId', { type: () => ID }) commentId: string,
    @Args('input') input: CommentInput,
  ): Promise<Comment | null> {
    const comment = await this.commentService.update(docId, commentId, input);

    if (comment) {
      // Publish GraphQL subscription event
      await this.pubSub.publish(`COMMENT_EVT:${docId}`, {
        commentEvent: {
          type: 'UPDATE',
          comment,
        },
      });

      // Send SSE notification
      const userIds = ['demo-user'];
      this.notificationService.notifyAllUsers(userIds, {
        type: 'UPDATE',
        docId,
        commentId: comment.commentId,
        author: comment.author,
        text: comment.text,
      });
    }

    return comment;
  }

  @Mutation(() => Boolean, { name: 'deleteComment' })
  async deleteComment(
    @Args('docId', { type: () => ID }) docId: string,
    @Args('commentId', { type: () => ID }) commentId: string,
  ): Promise<boolean> {
    // Get comment before deletion for notification
    const comment = await this.commentService.findById(docId, commentId);
    const result = await this.commentService.delete(docId, commentId);

    if (result && comment) {
      // Publish GraphQL subscription event
      await this.pubSub.publish(`COMMENT_EVT:${docId}`, {
        commentEvent: {
          type: 'DELETE',
          commentId,
        },
      });

      // Send SSE notification
      const userIds = ['demo-user'];
      this.notificationService.notifyAllUsers(userIds, {
        type: 'DELETE',
        docId,
        commentId,
        author: comment.author,
        text: comment.text,
      });
    }

    return result;
  }
}
