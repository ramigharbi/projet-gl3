import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment, CommentInput, CommentEvent } from './dto/comment.dto';
import { Inject } from '@nestjs/common';
import { PUB_SUB } from '../pubsub.provider';
import { PubSub } from 'graphql-subscriptions';
import { CommentPayload } from './dto/comment.payload';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [Comment])
  async comments(@Args('docId') docId: string): Promise<Comment[]> {
    return this.commentService.getComments(docId);
  }

  @Mutation(() => CommentPayload)
  async addComment(
    @Args('docId') docId: string,
    @Args('createCommentInput') createCommentInput: CommentInput,
  ): Promise<CommentPayload> {
    const newComment = await this.commentService.add(docId, createCommentInput);
    const payload: CommentEvent = { type: 'ADDED', comment: newComment, commentId: newComment.commentId, docId };
    void this.pubSub.publish(`COMMENT_EVT:${docId}`, payload);
    return { comment: newComment, message: 'Comment added successfully' };
  }

  @Mutation(() => CommentPayload)
  async updateComment(
    @Args('docId') docId: string,
    @Args('id') id: string,
    @Args('updateCommentInput') updateCommentInput: CommentInput,
  ): Promise<CommentPayload> {
    const updatedComment = await this.commentService.update(docId, id, updateCommentInput);
    if (!updatedComment) throw new Error('Comment not found');
    const payload: CommentEvent = { type: 'UPDATED', comment: updatedComment, commentId: id, docId };
    void this.pubSub.publish(`COMMENT_EVT:${docId}`, payload);
    return { comment: updatedComment, message: 'Comment updated successfully' };
  }

  @Mutation(() => CommentPayload)
  async deleteComment(
    @Args('docId') docId: string,
    @Args('id') id: string,
  ): Promise<CommentPayload> {
    const commentToDelete = await this.commentService.findById(docId, id);
    if (!commentToDelete) throw new Error('Comment not found');
    await this.commentService.delete(docId, id);
    const payload: CommentEvent = { type: 'DELETED', comment: commentToDelete, commentId: id, docId };
    void this.pubSub.publish(`COMMENT_EVT:${docId}`, payload);
    return { comment: commentToDelete, message: 'Comment deleted successfully' };
  }

  @Subscription(() => CommentEvent, {
    name: 'commentEvent',
    filter: (payload: CommentEvent, variables: { docId: string }) => payload.docId === variables.docId,
    resolve: (payload: CommentEvent) => payload,
  })
  commentEvent(@Args('docId') docId: string) {
    return this.pubSub.asyncIterator<CommentEvent>(`COMMENT_EVT:${docId}`);
  }
}
