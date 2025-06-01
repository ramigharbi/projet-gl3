import { ObjectType, Field } from '@nestjs/graphql';
import { Comment } from './comment.dto';

@ObjectType()
export class CommentPayload {
  @Field(() => Comment)
  comment: Comment;

  @Field()
  message: string;
}
