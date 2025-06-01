import { Injectable } from '@nestjs/common';
import { Comment, CommentInput } from './dto/comment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommentService {
  private comments: Map<string, Comment[]> = new Map(); // docId -> comments[]

  async getComments(docId: string): Promise<Comment[]> {
    return this.comments.get(docId) || [];
  }

  async add(docId: string, input: CommentInput): Promise<Comment> {
    const comment: Comment = {
      commentId: uuidv4(),
      docId,
      text: input.text,
      author: input.author,
      createdAt: new Date(),
      updatedAt: new Date(),
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
    };

    if (!this.comments.has(docId)) {
      this.comments.set(docId, []);
    }

    this.comments.get(docId)!.push(comment);
    return comment;
  }


  async delete(docId: string, commentId: string): Promise<boolean> {
    const comments = this.comments.get(docId);
    if (!comments) return false;

    const commentIndex = comments.findIndex((c) => c.commentId === commentId);
    if (commentIndex === -1) return false;

    comments.splice(commentIndex, 1);
    return true;
  }

  async findById(docId: string, commentId: string): Promise<Comment | null> {
    const comments = this.comments.get(docId);
    if (!comments) return null;

    return comments.find((c) => c.commentId === commentId) || null;
  }
}
